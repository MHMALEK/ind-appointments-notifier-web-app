import * as contentful from "contentful";
import axios from "axios";

console.log("asdasd", process.env.REACT_APP_CONTENTFULL_API_TOKEN);
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.REACT_APP_CONTENTFULL_API_SPACE as string,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.REACT_APP_CONTENTFULL_API_TOKEN as string,
});

export const fetchIndServicesAndDesksList = async () => {
  try {
    const res = await client.getEntry("6iIBzea4MHGAkhyNYr3urK");
    return (res.fields as any).indData.data;
  } catch (e) {
    console.log(e);
  }
};

export const postIndNotifierRequest = async (payload: any) => {
  try {
    const res: any = await axios.post(
      `${process.env.REACT_APP_BASE_API_URL}/new-appointment-notifier`,
      {
        ...payload,
      }
    );

    console.log("res", res);
    return res;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const postIndNotifierRequestEmail = async (payload: any) => {
  try {
    const res: any = await axios.post(
      `${process.env.REACT_APP_BASE_API_URL}/new-appointment-notifier/email`,
      {
        ...payload,
      }
    );

    console.log("res", res);
    return res;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getSoonestAppointment = async (
  selectedIndService: string,
  selectedIndDesk: string
) => {
  const res = await axios.get(
    `${process.env.REACT_APP_BASE_API_URL}/appointments/soonest?service=${selectedIndService}&desk=${selectedIndDesk}`
  );

  return res;
};
