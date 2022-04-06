/**
 * Recibe una cadena y reemplaza los carácteres que tengan la estructura %{<text>}.
 * @param text Texto a procesar
 * @param options Objeto cuyas keys se deben de encontrar en la cadena para que el valor de cada propiedad del objeto sea reemplazdo en el texto
 */
export function homologateString(
  text: string,
  options: { [key: string]: string | number } = {}
) {
  let _text = text;

  Object.entries(options).forEach(([key, value]) => {
    const regex = new RegExp(`%{${key}}`, "g");

    _text = _text.replace(regex, value.toString());
  });

  return _text;
}
