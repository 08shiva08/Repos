const { Project, SyntaxKind } = require("ts-morph");
const fg = require("fast-glob");
const path = require("path");
const fs = require("fs");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});

const files = fg.sync(["**/*.{ts,tsx,js,jsx}"], {
  ignore: ["node_modules", "dist", "build"],
});

files.forEach((file) => {
  project.addSourceFileAtPath(file);
});

function analyzeSourceFile(file) {
  const components = [];

  file.getFunctions().forEach((fn) => {
    const name = fn.getName();
    const isComponent = /^[A-Z]/.test(name || "");
    if (!isComponent) return;

    const metadata = {
      name,
      type: "functional",
      props: [],
      state: [],
      hooks: [],
      methods: [],
      callGraph: {},
      lifecycle: {},
      lifecycleUsage: {},
      children: [],
    };

    const params = fn.getParameters();
    if (params.length > 0) {
      metadata.props = params.map((p) => p.getName());
    }

    fn.forEachDescendant((node) => {
      const kind = node.getKindName();

      if (kind === "CallExpression") {
        const expr = node.getExpression().getText();

        if (expr === "useState") {
          const variable = node.getParent().getFirstChildByKind(SyntaxKind.ArrayBindingPattern);
          if (variable) {
            const stateVar = variable.getElements()[0]?.getText();
            if (stateVar) metadata.state.push(stateVar);
          }
        }

        if (/use(E?ffect|Memo|Callback|LayoutEffect)/.test(expr)) {
          const hookType = expr;
          metadata.hooks.push(hookType);

          const args = node.getArguments();
          const body = args[0]?.getText() || "";
          const deps = args[1]?.getText() || "";

          metadata.lifecycle[hookType] = metadata.lifecycle[hookType] || [];
          metadata.lifecycle[hookType].push({
            body,
            dependencies: deps,
          });

          metadata.lifecycleUsage[hookType] = metadata.lifecycleUsage[hookType] || {
            stateUsed: [],
            methodsUsed: [],
          };

          node.forEachDescendant((child) => {
            if (child.getKindName() === "Identifier") {
              const name = child.getText();
              if (metadata.state.includes(name)) {
                metadata.lifecycleUsage[hookType].stateUsed.push(name);
              }
              // not tracking method calls directly here for functional comp
            }
          });
        }
      }

      if (kind === "JsxOpeningElement") {
        const tag = node.getTagNameNode().getText();
        if (/^[A-Z]/.test(tag)) {
          metadata.children.push(tag);
        }
      }
    });

    components.push(metadata);
  });

  file.getClasses().forEach((cls) => {
    const name = cls.getName();
    if (!name) return;

    const metadata = {
      name,
      type: "class",
      props: [],
      state: [],
      methods: [],
      callGraph: {},
      lifecycle: {},
      lifecycleUsage: {},
      children: [],
    };

    cls.getMethods().forEach((method) => {
      const methodName = method.getName();
      const bodyText = method.getBodyText() || "";

      if (
        [
          "constructor",
          "componentDidMount",
          "componentWillUnmount",
          "componentDidUpdate",
          "componentWillMount",
        ].includes(methodName)
      ) {
        metadata.lifecycle[methodName] = bodyText.split("\n").map((line) => line.trim());
        metadata.lifecycleUsage[methodName] = {
          stateUsed: [],
          methodsUsed: [],
        };

        method.forEachDescendant((node) => {
          const text = node.getText();
          if (text.includes("this.state")) {
            metadata.lifecycleUsage[methodName].stateUsed.push(text);
          }
          if (text.includes("this.") && !text.includes("this.state")) {
            metadata.lifecycleUsage[methodName].methodsUsed.push(text);
          }
        });
      } else {
        const calls = [];
        method.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
          const called = call.getExpression().getText();
          calls.push(called);
        });

        metadata.methods.push({
          name: methodName,
          body: bodyText,
        });

        if (calls.length > 0) {
          metadata.callGraph[methodName] = calls;
        }
      }

      if (methodName === "constructor") {
        method.forEachDescendant((node) => {
          if (node.getKindName() === "PropertyAccessExpression") {
            if (node.getText().includes("this.state")) {
              const init = node.getParent().getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
              if (init) {
                init.getProperties().forEach((prop) => {
                  const stateName = prop.getName();
                  if (stateName) metadata.state.push(stateName);
                });
              }
            }
          }
        });
      }

      method.forEachDescendant((node) => {
        if (node.getKindName() === "JsxOpeningElement") {
          const tag = node.getTagNameNode().getText();
          if (/^[A-Z]/.test(tag)) {
            metadata.children.push(tag);
          }
        }
      });
    });

    components.push(metadata);
  });

  return components;
}

const allComponents = [];

project.getSourceFiles().forEach((file) => {
  const analyzed = analyzeSourceFile(file);
  if (analyzed.length > 0) {
    console.log(`[Analyzing] ${file.getBaseName()} - Found ${analyzed.length} component(s)`);
    allComponents.push(...analyzed);
  }
});

fs.writeFileSync("component-metadata.json", JSON.stringify(allComponents, null, 2));

console.log("✅ Component analysis complete. Saved to component-metadata.json");
