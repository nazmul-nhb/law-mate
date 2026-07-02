import { DATA_SHAPE, SIMPLE_DATA_SHAPE } from '@/constants/app';

export function SampleDataLayout() {
	return (
		<div className="space-y-4 text-xs font-mono">
			<p className="text-muted-foreground leading-relaxed">
				The JSON file must match one of the following formats to import successfully:
			</p>

			<div className="space-y-1">
				<span className="font-semibold text-foreground">1. Full Database Export</span>
				<p className="text-[10px] text-muted-foreground">
					Includes metadata block (exported via Full Export):
				</p>
				<pre className="p-2 rounded bg-muted text-[10px] whitespace-pre overflow-x-auto">
					{DATA_SHAPE}
				</pre>
			</div>

			<div className="space-y-1">
				<span className="font-semibold text-foreground">2. Simple Table Export</span>
				<p className="text-[10px] text-muted-foreground">
					Direct table-to-array dictionary:
				</p>
				<pre className="p-2 rounded bg-muted text-[10px] whitespace-pre overflow-x-auto">
					{SIMPLE_DATA_SHAPE}
				</pre>
			</div>

			<div className="rounded border border-border p-2 bg-muted/20 text-[10px] space-y-1 text-muted-foreground leading-relaxed">
				<p>
					<strong className="text-foreground">Fields details:</strong>
				</p>
				<ul className="list-disc pl-3 space-y-0.5">
					<li>
						<code className="text-foreground font-semibold">title</code> (string,
						required)
					</li>
					<li>
						<code className="text-foreground font-semibold">description</code>{' '}
						(string, optional for laws, required for notes)
					</li>
					<li>
						<code className="text-foreground font-semibold">id</code> (uuid,
						optional)
					</li>
					<li>
						<code className="text-foreground font-semibold">user_id</code> (uuid,
						optional)
					</li>
					<li>
						<code className="text-foreground font-semibold">law_id</code> (uuid,
						required for notes)
					</li>
					<li>
						<code className="text-foreground font-semibold">
							created_at / updated_at / deleted_at
						</code>{' '}
						(ISO dates, optional)
					</li>
					<li>
						<code className="text-foreground font-semibold">version</code> (number,
						optional)
					</li>
				</ul>
			</div>
		</div>
	);
}
