const BASE_URL = "http://127.0.0.1:8000";




export const createTrade = async (data) => {
  const res = await fetch(`${BASE_URL}/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};


export const getDashboard = async () => {
  const res = await fetch(`${BASE_URL}/dashboard`);
  return res.json();
};

export async function getVegetableAnalytics() {
  const res = await fetch(`${BASE_URL}/analytics/vegetables`);
  return res.json();
}

export async function getTrades() {
  const res = await fetch(`${BASE_URL}/trades`);
  return res.json();
}
export async function updateArrival(id, actual_price) {
  const res = await fetch(`${BASE_URL}/arrival/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actual_price }),
  });

  return res.json();
}
export async function getPrediction(vegetable, date) {
  const res = await fetch(
    `http://127.0.0.1:8000/ml/predict?vegetable=${vegetable}&date=${date}`
  );
  return res.json();
}
