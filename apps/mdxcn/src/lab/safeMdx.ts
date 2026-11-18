type UnknownRecord = Record<string, unknown>;

const ALLOWED_LOWERCASE_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "del",
  "s",
  "code",
  "pre",
  "kbd",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "span",
  "hr",
  "input",
  "sup",
  "sub",
]);

const FORBIDDEN_ATTRIBUTE_NAMES = new Set([
  "dangerouslySetInnerHTML",
  "style",
  "ref",
  "href",
  "src",
  "srcSet",
  "action",
  "formAction",
]);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getType(node: unknown): string | undefined {
  if (!isRecord(node)) return undefined;
  const type = node.type;
  return typeof type === "string" ? type : undefined;
}

function getChildren(node: unknown): unknown[] {
  if (!isRecord(node)) return [];
  const children = node.children;
  return Array.isArray(children) ? children : [];
}

function getAttributeValueExpressionEstree(value: unknown): unknown {
  if (!isRecord(value)) return undefined;
  const data = value.data;
  if (!isRecord(data)) return undefined;
  return data.estree;
}

function isForbiddenAttributeName(name: string): boolean {
  return name.toLowerCase().startsWith("on") || FORBIDDEN_ATTRIBUTE_NAMES.has(name);
}

function isSafeExpression(expression: unknown): boolean {
  if (!isRecord(expression)) return false;

  const type = getType(expression);

  if (type === "Literal") {
    if ("regex" in expression) return false;
    const value = expression.value;
    return (
      value === null ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    );
  }

  if (type === "UnaryExpression") {
    const operator = expression.operator;
    const argument = expression.argument;
    return (
      (operator === "-" || operator === "+") &&
      isRecord(argument) &&
      getType(argument) === "Literal" &&
      typeof argument.value === "number"
    );
  }

  if (type === "ArrayExpression") {
    const elements = expression.elements;
    if (!Array.isArray(elements)) return false;

    for (const element of elements) {
      if (element === null) return false;
      if (!isRecord(element) || getType(element) === "SpreadElement") return false;
      if (!isSafeExpression(element)) return false;
    }

    return true;
  }

  if (type === "TemplateLiteral") {
    const expressions = expression.expressions;
    return Array.isArray(expressions) && expressions.length === 0;
  }

  return false;
}

function validateExpressionAttribute(attrValue: unknown, elementName: string): void {
  const estree = getAttributeValueExpressionEstree(attrValue);

  if (!isRecord(estree) || getType(estree) !== "Program") {
    throw new Error(`Not allowed: expression in <${elementName}> prop`);
  }

  const body = estree.body;
  if (!Array.isArray(body) || body.length !== 1) {
    throw new Error(`Not allowed: expression in <${elementName}> prop`);
  }

  const statement = body[0];
  if (!isRecord(statement) || getType(statement) !== "ExpressionStatement") {
    throw new Error(`Not allowed: expression in <${elementName}> prop`);
  }

  if (!isSafeExpression(statement.expression)) {
    throw new Error(`Not allowed: expression in <${elementName}> prop`);
  }
}

function visitJsxElement(node: unknown, components: ReadonlySet<string>): void {
  if (!isRecord(node)) return;

  const name = node.name;

  if (name === null) {
    // Fragment is allowed.
  } else if (typeof name !== "string") {
    throw new Error(`Not allowed: <${String(name)}>`);
  } else {
    const isAllowedComponent = /^[A-Z]/.test(name) && components.has(name);
    const isAllowedLowerTag = /^[a-z]/.test(name) && ALLOWED_LOWERCASE_TAGS.has(name);

    if (name.includes(".") || (!isAllowedComponent && !isAllowedLowerTag)) {
      throw new Error(`Not allowed: <${name}>`);
    }
  }

  const attributes = node.attributes;
  if (!Array.isArray(attributes)) return;

  for (const attr of attributes) {
    if (!isRecord(attr)) continue;

    const attrType = getType(attr);

    if (attrType === "mdxJsxExpressionAttribute") {
      throw new Error("Not allowed: spread attributes");
    }

    if (attrType !== "mdxJsxAttribute") {
      throw new Error("Not allowed: invalid attribute");
    }

    const attrName = typeof attr.name === "string" ? attr.name : "";

    if (isForbiddenAttributeName(attrName)) {
      throw new Error(`Not allowed: ${attrName} attribute`);
    }

    const attrValue = attr.value;
    if (attrValue === null || typeof attrValue !== "object") continue;

    const valueType = getType(attrValue);
    if (valueType === "mdxJsxAttributeValueExpression") {
      validateExpressionAttribute(
        attrValue,
        typeof name === "string" ? name : "unknown",
      );
    }
  }
}

function walk(node: unknown, components: ReadonlySet<string>): void {
  const type = getType(node);
  if (!type) return;

  if (type === "mdxjsEsm") {
    throw new Error("Not allowed: import/export");
  }

  if (type === "mdxFlowExpression" || type === "mdxTextExpression") {
    throw new Error("Not allowed: {expressions}");
  }

  if (type === "mdxJsxFlowElement" || type === "mdxJsxTextElement") {
    visitJsxElement(node, components);
  }

  const children = getChildren(node);
  for (const child of children) {
    walk(child, components);
  }
}

export function remarkSafeMdx(options: {
  components: ReadonlySet<string>;
}): (tree: unknown) => void {
  return (tree) => {
    walk(tree, options.components);
  };
}
