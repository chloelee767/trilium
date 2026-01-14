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

        // Disable mention command when selection is in inline code
        const mentionCommand = editor.commands.get('mention');
        if (mentionCommand) {
            // Store the original refresh method
            const originalRefresh = mentionCommand.refresh.bind(mentionCommand);

            // Override the refresh method to check for inline code
            mentionCommand.refresh = function() {
                // Call the original refresh first
                originalRefresh();

                // Then check if we're in inline code and disable if so
                const selection = editor.model.document.selection;
                const hasCodeAttribute = selection.hasAttribute('code');

                if (hasCodeAttribute) {
                    this.isEnabled = false;
                }
            };
        }
    }
}
