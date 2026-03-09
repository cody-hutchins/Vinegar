import { parse } from 'node-html-parser';

import fs from 'node:fs';

const JSX_STRING = /\(\s*(<.*)>\s*\)/gs
const PROP_MATCH_CURLY = /[a-zA-Z0-9-_]{1,30}={[^}]+}/gs
const PROP_MATCH_QUOTE = /[a-zA-Z0-9-_]{1,30}="[^"]+"/gs

function getAttrs(_attrsStr) {
    if (typeof _attrsStr !== 'string') {
        console.log('We cant process this! ERR!')
        return {};
    }
    let objAttrs = {}
    const attrsStr = _attrsStr.trim()
    if(attrsStr.length === 0) return objAttrs;
    let parts = attrsStr.match(PROP_MATCH_CURLY) || []
    let parts2 = attrsStr.match(PROP_MATCH_QUOTE) || [];
    if (!parts.length && !parts2.length) return objAttrs;

    parts?.forEach( p => {
        const [name, value] = p.split('={', 2)
        objAttrs[name] = (value.substring(0, value.length - 1))
    })
    parts2?.forEach( p => {
        const [name, value] = p.split('="', 2)
        objAttrs[name] = (value.substring(0, value.length - 1))
    })
    return objAttrs
}

function geminisIdea(root) {
    // we want to operate on an array of nodes, so if the array for this node is empty, leave
    if (Array.isArray(root.childNodes)) {
        if (root.childNodes.length == 0) return;

        root.childNodes.forEach(geminisIdea)

        const hasVIFChild = root.childNodes.some((child) => {
            const outerProps = getAttrs(child.rawAttrs)
            return outerProps.hasOwnProperty('v-if');
        });
        const hasVELSEChild = root.childNodes.some((child) => {
            const outerProps = getAttrs(child.rawAttrs)
            return outerProps.hasOwnProperty('v-else-if') || outerProps.hasOwnProperty('v-else');
        });
        if (hasVELSEChild && !hasVIFChild) {
            console.log('The list of children doesnt have a V-ID but does have a V-ELSE. Giving up.')
            return;
        }
        if (hasVIFChild) {
            console.log('We want to wrap this, and its siblings altogether')
            let result = '';
            [...root.childNodes].forEach((child) => {
                const props = getAttrs(child.rawAttrs)
                if (!Object.keys(props).length  && child.nodeType === 3) {
                    result = result + child._rawText.trim() ;
                } else if (!hasVELSEChild) {
                    result = result + `(${props['v-if']}) && ${child.outerHTML}`
                } else {
                    if (props['v-if']) {
                        result += `(${props['v-if']}) ? ${child.outerHTML} : `;
                    } else if (props['v-else-if']) {
                        result += `(${props['v-else-if']}) ? ${child.outerHTML} : `;
                    } else if (props['v-else']) {
                        result += `${child.outerHTML}`;
                    }
                }
                root.removeChild(child)
            })
            if (result.endsWith(' : ')) result = result + 'null'; // Close the dangling colon
            result = result.replaceAll(/v-if={[^}]+}/g, '').replaceAll(/v-else-if={[^}]+}/g, '').replaceAll(/v-else={[^}]+}/g, '')
            root.set_content('{' + result + '}')
        }
    } else {
        console.log('no children in node')
    }
}

async function parseJSXFile(argv) {
    let content = await fs.promises.readFile('/var/home/chutchins/development/Vinegar/Vinegar/' + argv[2])
    let str = content.toString()

    let matches = JSX_STRING.exec(str)
    if (matches) {
        let HTML = matches[1] + ">"
        const root = parse(HTML)
        geminisIdea(root)
        await fs.promises.writeFile("output.js", root.outerHTML)
    }
}


parseJSXFile(process.argv).then()