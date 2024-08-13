import { RefreshCw } from "lucide-react";

const Loading = () => {
	return (
		<div className="flex h-svh items-center justify-center">
			<RefreshCw className="animate-spin size-20" />
		</div>
	);
};

export default Loading;
