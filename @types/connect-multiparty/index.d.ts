declare module 'connect-multiparty' {
   import express from 'express';
    
   function multiparty():express.RequestHandler;

   export = multiparty;
}