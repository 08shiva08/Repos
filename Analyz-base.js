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
      hooks: [],
      state: [],
      props: [],
      methods: [],
      lifecycle: {},
    };

    fn.forEachDescendant((node) => {
      if (node.getKindName() === "CallExpression") {
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
      state: [],
      props: [],
      methods: [],
      lifecycle: {},
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
      } else {
        metadata.methods.push({
          name: methodName,
          body: bodyText,
        });
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
    });

    components.push(metadata);
  });

  return components;
}

const allComponents = [];

project.getSourceFiles().forEach((file) => {
  const analyzed = analyzeSourceFile(file);
  if (analyzed.length > 0) {
    allComponents.push(...analyzed);
  }
});

fs.writeFileSync("component-metadata.json", JSON.stringify(allComponents, null, 2));

console.log("Component analysis complete. Saved to component-metadata.json");
