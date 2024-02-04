import * as contentful from "contentful";
import axios from "axios";

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

export const postIndNotifierRequest = (payload: any, token: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const res: any = await axios.post(
        `${process.env.REACT_APP_BASE_API_URL}/notification/new`,
        {
          ...payload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      resolve(res);
    } catch (e: any) {
      if (e.response?.data) {
        reject(e.response.data);
      } else {
        reject(e);
      }
    }
  });

export const getAllNotificationsForMyUser = (payload: any, token: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const res: any = await axios.get(
        `${process.env.REACT_APP_BASE_API_URL}/notification/list/all`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      resolve(res.data);
    } catch (e: any) {
      if (e.response?.data) {
        reject(e.response.data);
      } else {
        reject(e);
      }
    }
  });

export const removeNotification = (notification_id: any) =>
  new Promise(async (resolve, reject) => {
    try {
      const res: any = await axios.get(
        `${process.env.REACT_APP_BASE_API_URL}/users/unsubscribe?notification_id=${notification_id}`
      );

      resolve(res.data);
    } catch (e: any) {
      if (e.response?.data) {
        reject(e.response.data);
      } else {
        reject(e);
      }
    }
  });

export const removeAndUnsubscribeUser = (user_id: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const res: any = await axios.delete(
        `${process.env.REACT_APP_BASE_API_URL}/users/delete?user_id=${user_id}`
      );

      resolve(res.data);
    } catch (e: any) {
      if (e.response?.data) {
        reject(e.response.data);
      } else {
        reject(e);
      }
    }
  });

export const getSoonestAppointment = async (
  selectedIndService: string,
  selectedIndDesk: string
) => {
  const res = await axios.get(
    `${process.env.REACT_APP_BASE_API_URL}/appointments/soonest?service=${selectedIndService}&desk=${selectedIndDesk}`
  );

  return res;
};

const fetchAllAppointmentsForAService = async (code: any, desks: any) => {
  let results: any = [];

  for (let i = 0; i < desks.length; i++) {
    const { data } = await getSoonestAppointment(code, desks[i].code);
    if (data) {
      results.push({
        ...data,
        deskCode: desks[i].code,
        deskLabel: desks[i].label,
      });
    }
  }

  return results;
};
export const getSoonestAppointmentsForAllDesksAndServices = async () => {
  let appointments: any = {};

  try {
    const res = await client.getEntry("6iIBzea4MHGAkhyNYr3urK");
    const { servicesByDesks } = (res.fields as any).indData.data;
    const servicesByDesksArray = Object.values(servicesByDesks) as any;

    for (let i = 0; i < servicesByDesksArray.length; i++) {
      const appointment = await fetchAllAppointmentsForAService(
        servicesByDesksArray[i].code,
        servicesByDesksArray[i].desks
      );

      const appointmentData = appointment.filter((item: any) => item);
      appointments[servicesByDesksArray[i].code] = [...appointmentData];
    }
    return appointments;
  } catch (e) {
    console.log(e);
  }
};

export const sendPushNotificationToken = async (
  token: string,
  user_id: string,
  email: string
) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_BASE_API_URL}/users/set-push-token`,
      { token, user_id, email }
    );
    return res;
  } catch (e) {
    console.log(e);
  }
};
