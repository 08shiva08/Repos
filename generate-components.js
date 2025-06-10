const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "generated-components");
const totalComponents = 100;

const extensions = [".js", ".jsx", ".ts", ".tsx"];
const imports = [
  `import axios from 'axios';`,
  `import _ from 'lodash';`,
  `import moment from 'moment';`,
  `import { v4 as uuidv4 } from 'uuid';`,
  `import classNames from 'classnames';`,
];
const hooks = ["useEffect", "useState", "useRef", "useMemo"];
const lifecycles = ["componentDidMount", "componentWillUnmount", "shouldComponentUpdate"];
const methods = ["fetchData", "handleClick", "calculate", "logEvent"];
const propsList = ["title", "count", "user", "onComplete", "items"];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

for (let i = 1; i <= totalComponents; i++) {
  const isFunctional = Math.random() > 0.5;
  const ext = random(extensions);
  const name = `Component${i}`;
  const childName = i < totalComponents ? `Component${i + 1}` : null;
  const imp = random(imports);
  const prop = random(propsList);
  const method = random(methods);
  const isTS = ext === ".ts" || ext === ".tsx";

  const interfaceCode = isTS
    ? `
interface ComponentProps {
  title?: string;
  count?: number;
  user?: string;
  onComplete?: () => void;
  items?: string[];
}
  `.trim()
    : "";

  let content = "";

  if (isFunctional) {
    const hook = random(hooks);
    const propsParam = isTS ? `(props: ComponentProps)` : `({ ${prop} })`;
    const propAccess = isTS ? `props.${prop}` : prop;

    content = `
import React, { ${hook}, useState, useEffect } from 'react';
${imp}
${childName ? `import ${childName} from './${childName}${ext}';` : ''}
${isTS ? interfaceCode : ''}

const ${name} = ${propsParam} => {
  const [state, setState] = useState(${isTS ? "number" : "0"});

  useEffect(() => {
    console.log('${name} mounted');
    return () => {
      console.log('${name} unmounted');
    };
  }, []);

  const ${method} = async () => {
    try {
      const res = await axios.get('https://jsonplaceholder.typicode.com/posts/${i}');
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>${name}</h2>
      <p>Prop: {${propAccess}}</p>
      <button onClick={${method}}>Click</button>
      ${childName ? `<${childName} ${prop}={${propAccess}} />` : ''}
    </div>
  );
};

export default ${name};
    `.trim();
  } else {
    const typeExtends = isTS ? `<ComponentProps>` : "";
    const propAccess = isTS ? `this.props.${prop}` : `this.props.${prop}`;

    const lifecycleMethods = lifecycles.map((methodName) => {
      if (methodName === "componentDidMount") {
        return `  componentDidMount() {\n    console.log("${name} mounted");\n  }`;
      }
      if (methodName === "componentWillUnmount") {
        return `  componentWillUnmount() {\n    console.log("${name} unmounted");\n  }`;
      }
      if (methodName === "shouldComponentUpdate") {
        return `  shouldComponentUpdate() {\n    return true;\n  }`;
      }
      return "";
    }).join("\n\n");

    content = `
import React, { Component } from 'react';
${imp}
${childName ? `import ${childName} from './${childName}${ext}';` : ''}
${isTS ? interfaceCode : ''}

class ${name} extends Component${typeExtends} {
  constructor(props${isTS ? ": ComponentProps" : ""}) {
    super(props);
    this.state = { value: 0 };
  }

  ${method} = async () => {
    try {
      const res = await axios.get('https://jsonplaceholder.typicode.com/users/${i}');
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

${lifecycleMethods}

  render() {
    return (
      <div>
        <h2>${name}</h2>
        <p>Prop: {${propAccess}}</p>
        <button onClick={this.${method}}>Click</button>
        ${childName ? `<${childName} ${prop}={${propAccess}} />` : ''}
      </div>
    );
  }
}

export default ${name};
    `.trim();
  }

  fs.writeFileSync(path.join(outputDir, `${name}${ext}`), content);
}

console.log(`✅ Generated ${totalComponents} components in various formats with TS interfaces`);
