class Response {
  success: boolean;
  message?: string;
  data?: object;

  constructor({
    success,
    message,
    data,
  }: {
    success: boolean;
    message?: string;
    data?: object;
  }) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export default Response;
