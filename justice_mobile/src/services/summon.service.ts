import api from "./api";

export const createSummon = async (data: any) => {
  const res = await api.post("/summons", data);
  return res.data;
};

export const getSummonsByComplaint = async (complaintId: number) => {
  const res = await api.get(`/summons/complaint/${complaintId}`);
  return res.data;
};

export const updateSummonStatus = async (id: number, status: string) => {
  const res = await api.patch(`/summons/${id}/status`, { status });
  return res.data;
};