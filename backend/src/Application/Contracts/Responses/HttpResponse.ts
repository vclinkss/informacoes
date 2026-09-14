export type HttpResponse<T = unknown> = {
  statusCode: number;
  body: T;
};

export function ok<T>(body: T): HttpResponse<T> {
  return { statusCode: 200, body };
}

export function created<T>(body: T): HttpResponse<T> {
  return { statusCode: 201, body };
}

export function noContent(): HttpResponse<null> {
  return { statusCode: 204, body: null };
}

export function badRequest(
  message: string
): HttpResponse<{ message: string }> {
  return { statusCode: 400, body: { message } };
}

export function unauthorized(
  message = "Unauthorized"
): HttpResponse<{ message: string }> {
  return { statusCode: 401, body: { message } };
}

export function forbidden(
  message = "Forbidden"
): HttpResponse<{ message: string }> {
  return { statusCode: 403, body: { message } };
}

export function notFound(
  message = "Not found"
): HttpResponse<{ message: string }> {
  return { statusCode: 404, body: { message } };
}

export function serverError(
  message = "Internal server error"
): HttpResponse<{ message: string }> {
  return { statusCode: 500, body: { message } };
}
