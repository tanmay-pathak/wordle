import Page from "@/components/page";
import React from "react";

const Download = () => {
	return (
		<Page>
			<section className="prose prose-sm sm:prose-lg max-w-none">
				<h1>Add to Homescreen</h1>
				<p>For easy access, add this website to your homescreen.</p>
				<div className="gap-2">
					<img
						src="https://r2.tanmaypathak.com/wordle-screenshot-1.png"
						className="object-contain"
					/>
					<img src="https://r2.tanmaypathak.com/zudle-screenshot-2.png" />
				</div>
			</section>
		</Page>
	);
};

export default Download;
