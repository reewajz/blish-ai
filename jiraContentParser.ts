export function extractContentText(content: Record<string, any>[]) {
  let result = "";

  content.forEach((item: any) => {
    if (item.type === "paragraph") {
      item.content.forEach((element: any) => {
        if (element.type === "text") {
          result += element.text;
        }
      });
    } else if (item.type === "orderedList" || item.type === "bulletList") {
      item.content.forEach((listItem: any) => {
        listItem.content.forEach((subElement: any) => {
          if (
            subElement.type === "paragraph" &&
            subElement.content.length > 0 &&
            subElement.content[0].type === "text"
          ) {
            result += subElement.content[0].text;
          }
        });
      });
    }
  });

  return result;
}
