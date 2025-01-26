// import {
//   Middleware,
//   ExpressErrorMiddlewareInterface,
// } from "routing-controllers";

// @Middleware({ type: "after" })
// export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
//   error(error: any, request: any, response: any, next: (err?: any) => any) {
//     if (!response.headersSent) {
//       response.status(404).json({
//         message: "Oops! The route you are trying to access does not exist.",
//       });
//     }
//     next(error); // C
//   }
// }
