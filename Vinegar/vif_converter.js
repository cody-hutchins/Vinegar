import { parse } from "node-html-parser";

import fs from "node:fs";

const JSX_STRING = /\(\s*(<.*)>\s*\)/gs;
const VIF = /v-if/gs;
const PROP_AS_FLAG = /[a-zA-Z0-9-_]{1,30}/gs;
const PROP_MATCH_CURLY = /[a-zA-Z0-9-_]{1,30}={[^}]+}/gs;
const PROP_MATCH_QUOTE = /[a-zA-Z0-9-_]{1,30}="[^"]+"/gs;
const DOUBLE_CURLY = /[a-zA-Z0-9-_]{1,30}={{[^}]+}}/gs;

const COMMON_UNCLOSED_TAGS = ["input", "img", "br", "hr"];

function getAttrs(_attrsStr) {
  if (typeof _attrsStr !== "string") {
    console.log("We cant process this! ERR!");
    return {};
  }
  let objAttrs = {};
  const attrsStr1 = _attrsStr.trim();
  if (attrsStr1.length === 0) return objAttrs;
  const parts0 = attrsStr1.match(DOUBLE_CURLY) || [];
  const attrsStr2 = attrsStr1.replace(DOUBLE_CURLY, "");
  const parts1 = attrsStr2.match(PROP_MATCH_CURLY) || [];
  const attrStr3 = attrsStr2.replace(PROP_MATCH_CURLY, "");
  const parts2 = attrStr3.match(PROP_MATCH_QUOTE) || [];
  const attrStr4 = attrStr3.replace(PROP_MATCH_QUOTE);
  const parts3 = attrStr4.match(PROP_AS_FLAG) || [];

  if (!parts0.length && !parts1.length && !parts2.length && !parts3.length) return objAttrs;

  parts0.forEach((p) => {
    const [name, value] = p.split("={", 2);
    objAttrs[name] = value.substring(0, value.length - 1);
  });

  parts1.forEach((p) => {
    const [name, value] = p.split("={", 2);
    objAttrs[name] = value.substring(0, value.length - 1);
  });

  parts2.forEach((p) => {
    const [name, value] = p.split('="', 2);
    objAttrs[name] = value.substring(0, value.length - 1);
  });

  parts3.forEach((name) => {
    if (name !== "undefined") {
      objAttrs[name] = null;
    }
  });

  console.log(objAttrs);
  return objAttrs;
}

const hasVifChild = (childNodes) =>
  childNodes.some((child) => {
    const props = getAttrs(child.rawAttrs);
    return props.hasOwnProperty("v-if");
  });

const hasVelseChild = (childNodes) =>
  childNodes.some((child) => {
    const props = getAttrs(child.rawAttrs);
    return props.hasOwnProperty("v-else-if") || props.hasOwnProperty("v-else");
  });

function geminisBadIdea(root) {
  console.log(Object.keys(root), Object.values(root));
  // we want to operate on an array of nodes, so if the array for this node is empty, leave
  if (Array.isArray(root.childNodes)) {
    if (root.childNodes.length == 0) return;

    root.childNodes.forEach(geminisBadIdea);

    const hasVIFChild = hasVifChild(root.childNodes);
    const hasVELSEChild = hasVelseChild(root.childNodes);

    if (hasVIFChild) {
      let result = [];
      console.log(Object.keys(result));
      [...root.childNodes].forEach((child) => {
        const props = getAttrs(child.rawAttrs);
        const isVCond = props.hasOwnProperty("v-if") || props.hasOwnProperty("v-else-if") || props.hasOwnProperty("v-else");
        if (!isVCond) {
          console.log("ignoring node");
          if (child.nodeType === 3) {
            result = [...result, [child._rawText.trim(), "normal"]];
          } else {
            result = [...result, [child.outerHTML, "normal"]];
          }
        } else if (!hasVELSEChild && props["v-if"]) {
          console.log("handling lone if");
          result = result = [...result, [`(${props["v-if"]}) && ${child.outerHTML.replaceAll(/v-if={[^}]+}/g, "")}`, "lonely-v-if"]];
        } else {
          console.log("handling if / else if / else");
          if (props["v-if"]) {
            result = [...result, [`(${props["v-if"]}) ? ${child.outerHTML.replaceAll(/v-if={[^}]+}/g, "")} : `, "v-if"]];
          } else if (props["v-else-if"]) {
            result = [...result, [`(${props["v-else-if"]}) ? ${child.outerHTML.replaceAll(/v-else-if={[^}]+}/g, "")} : `, , "v-else-if"]];
          } else if (props.hasOwnProperty("v-else")) {
            result = [...result, [`${child.outerHTML.replaceAll(/v-else/g, "")}`, "v-else"]];
          }
        }
        root.removeChild(child);
      });
      let acc = "";
      for (const element of result) {
        switch (element[1]) {
          case "normal":
            acc = acc + element[0];
            break;
          case "lonely-v-if":
            acc = acc + "{" + element[0] + "}";
            break;
          case "v-if":
            acc = acc + "{" + element[0];
            break;
          case "v-else-if":
            acc = acc + element[0];
            break;
          case "v-else":
            acc = acc + element[0] + "}";
            break;
        }
      }
      if (acc.endsWith(" : ")) acc += "null }"; // Close the dangling colon
      root.set_content(acc);
    } else if (hasVELSEChild) {
      console.log("The list of children doesnt have a V-ID but does have a V-ELSE. Giving up.");
      return;
    }
  } else {
    console.log("no children in node");
  }
}

async function parseJSXFile(argv) {
  if (!argv[2]) {
    throw new Error("no arg provided");
  }
  const filePath = process.cwd() + "/" + argv[2];
  let content = await fs.promises.readFile(filePath);
  let str = content.toString();
  const hasVIF = str.match(VIF);
  let matches = JSX_STRING.exec(str);
  if (matches && !!hasVIF) {
    let HTML = matches[1] + ">";
    const root = parse(HTML, { voidTag: { tags: [] } });
    geminisBadIdea(root); // edits root in place
    const ret = str
      .replace(JSX_STRING, "<>" + root.outerHTML + "</>")
      .replace("arrowfn", "=>")
      .replace("&gt;", ">")
      .replace("&lt;", "<");

    await fs.promises.writeFile(filePath + ".tsx", ret);
  }
  process.exit(1);
}

parseJSXFile(process.argv).then();
