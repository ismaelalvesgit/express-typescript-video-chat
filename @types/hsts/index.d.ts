declare module 'hsts'{
    import express from 'express';
    
    interface Handler {
        maxAge?: number;
        preload?: boolean;
        includeSubDomains?: boolean;
    }

    function hsts(options?: Readonly<Handler>):express.RequestHandler;

    export = hsts;
}