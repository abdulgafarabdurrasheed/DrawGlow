import { useEffect } from 'react';
import { Sparkles } from 'lucide-react'

interface Props {
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export default function Toast({ message, onDismiss, duration = 3000 }: Props) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [onDismiss, duration]);

    if (!message) return null;

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-full shadow-2xl animate-bounce z-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-medium text-sm text-white">{message}</span>
        </div>
    );
}