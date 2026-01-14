import { Plugin } from "ckeditor5";

/**
 * Disables the mention feature (triggered by `@`) inside code blocks and inline code.
 * This prevents the autocomplete popup from appearing when typing `@` within code.
 */
export default class DisableMentionInCodeBlock extends Plugin {
    public static get pluginName() {
        return "DisableMentionInCodeBlock" as const;
    }

    init() {
        const editor = this.editor;
        const schema = editor.model.schema;

        // Disallow mention attribute inside code blocks
        schema.addAttributeCheck((context, attributeName) => {
            if (attributeName === 'mention' && context.endsWith('codeBlock $text')) {
                return false;
            }
        });

        // Disable mention command in inline code
        schema.addAttributeCheck((context, attributeName) => {
            // TODO figure out how to avoid triggering the mention when the cursor moves outside of the inline code
            // is there a way to traverse the inline items in a single $text node?
            // perhaps this isn't the right approach, is it possible to exclude any text inside inline code from the feed produced for the mention feature?
            if (attributeName === 'mention' && context.endsWith('$text') ) {
                if (context.last.getAttribute('code')) {
                    return false;
                }
                let allItems : Array<string> = [];
                for (let i = 0; i < context.length; i++) {
                    const item = context.getItem(i);
                    allItems.push(`${item.name}=${Array.from(item.getAttributeKeys())}`)
                }
                console.log(`>>> CHECK: items=${allItems}`);
                if (context.length >= 2 && context.getItem(context.length - 2).getAttribute('code')) { // 2nd last item is inline code, ie. right after inline code
                    return false;
                }
            }
        });
    }
}
