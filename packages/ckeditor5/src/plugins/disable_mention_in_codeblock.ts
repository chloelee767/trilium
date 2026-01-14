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

        // Disallow mention attribute in inline code
        schema.addAttributeCheck((context, attributeName) => {
            if (attributeName === 'mention' && context.endsWith('$text')) {
                if (context.last.getAttribute('code')) {
                    return false;
                }
            }
        });
    }

    afterInit() {
        const editor = this.editor;

        // Wrap the mention feed to check for code context
        const mentionConfig = editor.config.get('mention');
        if (mentionConfig && Array.isArray(mentionConfig.feeds)) {
            mentionConfig.feeds.forEach((feedConfig: any) => {
                const originalFeed = feedConfig.feed;

                feedConfig.feed = async (queryText: string) => {
                    const selection = editor.model.document.selection;
                    const position = selection.getFirstPosition();

                    if (position) {
                        // Check if inside code block
                        if (position.parent.is('element', 'codeBlock')) {
                            return [];
                        }

                        // Check if inside inline code
                        const textNode = position.textNode || position.nodeBefore;
                        if (textNode && textNode.hasAttribute('code')) {
                            return [];
                        }
                    }

                    // Call original feed
                    return originalFeed(queryText);
                };
            });
        }
    }
}
