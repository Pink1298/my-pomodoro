"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorMessage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    return error ? <code className="block mt-2 p-2 bg-muted rounded text-xs">{error}</code> : null;
}

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <p className="max-w-md text-muted-foreground mb-6">
                There was a problem signing you in. This usually happens if the link expired or the configuration is incorrect.
            </p>
            <Suspense>
                <ErrorMessage />
            </Suspense>
            <a href="/" className="mt-6 text-primary hover:underline">
                Return to Home
            </a>
        </div>
    );
}
