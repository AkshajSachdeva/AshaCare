import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
});

export const getPatientById = async (patientId) => {
    const response = await apiClient.get(`/patients/${patientId}`);
    return response.data;
};

export const createCareCase = async (careCaseData) => {
    const response = await apiClient.post("/cases", careCaseData);
    return response.data;
};

export const getCareCaseById = async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}`);
    return response.data;
};

export const submitScreening = async (caseId, screeningData) => {
    const response = await apiClient.put(
        `/cases/${caseId}/screening`,
        screeningData
    );
    return response.data;
};

export const createReferral = async (caseId, referralData) => {
    const response = await apiClient.put(
        `/cases/${caseId}/referral`,
        referralData
    );
    return response.data;
};

export const scheduleAppointment = async (caseId, appointmentData) => {
    const response = await apiClient.put(
        `/cases/${caseId}/appointment`,
        appointmentData
    );
    return response.data;
};

export { apiClient };
