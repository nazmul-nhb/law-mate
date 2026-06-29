// @ts-check

import { defineScriptConfig } from 'nhb-scripts';

export default defineScriptConfig({
	commit: {
		runFormatter: false,
		emojiBeforePrefix: true,
		commitTypes: {
			custom: [
				{ emoji: '🚀', type: 'init' },
				{ emoji: '💩', type: 'dump' },
				{ emoji: '🧠', type: 'ideas' },
				{ emoji: '📝', type: 'draft' },
				{ emoji: '🔣', type: 'types' },
			],
		},
	},
});
