import { useState } from "react";
import CurrencyFormat from "react-currency-format";
import CheckMark from './checkMark.svg';

const WaitlistReactForm = () => {
  const [data, setData] = useState({
    location: "Lagos",
    downPayment: "",
    amount: "",
    canadianStatus: "Permanent resident",
    fullName: "",
    email: "",
    creditScore: "",
    phone: "",
    date: "",
    durationInCanada: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  //https://hooks.zapier.com/hooks/catch/4886427/2mi1ggt/

  const onHandleChange = (event) => {
    const { name, value } = event.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const onHandleSubmit = async () => {
    console.log(data);
    setLoading(true);
    const payload = { ...data };
    try {
      const response = await fetch(
        "https://hooks.zapier.com/hooks/catch/4886427/2mi1ggt/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      setLoading(false);
      setSuccess(true);
      console.log(response.json());
    } catch (error) {
      setLoading(false);
      window.alert("Failed to join, please try again");
      console.error(error.message);
    }
  };

  const isDisabled =
    !data?.location.length ||
    !data?.amount.length ||
    !data?.canadianStatus.length ||
    !data?.downPayment.length ||
    !data?.fullName.length ||
    !data?.creditScore.length ||
    !data?.email.length ||
    !data?.phone.length ||
    !data?.durationInCanada.length ||
    !data?.date.length;

  return (
    <section className="w-full">
      {success ? (
        <div className="flex flex-col justify-center items-center">
          <span className="w-20 h-20 rounded-full flex justify-center items-center bg-main">
           <svg
  width="60"
  height="60"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M18.4933 6.93502C18.8053 7.20743 18.8374 7.68122 18.565 7.99325L10.7079 16.9933C10.5654 17.1564 10.3594 17.25 10.1429 17.25C9.9263 17.25 9.72031 17.1564 9.57788 16.9933L6.43502 13.3933C6.16261 13.0812 6.19473 12.6074 6.50677 12.335C6.8188 12.0626 7.29259 12.0947 7.565 12.4068L10.1429 15.3596L17.435 7.00677C17.7074 6.69473 18.1812 6.66261 18.4933 6.93502Z"
    fill="#fff"></path>
</svg>
          </span>
          <h1 className="font-body-bold text-xl mt-5 text-center">Thank You for Joining Our Waitlist!</h1>
          <p className="text-base font-body-medium mt-4 text-center">We're thrilled to have you on board! 🎉 Thank you for joining our waitlist and showing interest in what we have to offer. Your enthusiasm means the world to us, and we can't wait to share our exciting products/services with you.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What's your name?
              </label>
              <input
                type="text"
                name="fullName"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="E.g Blessing Ebong"
                onChange={onHandleChange}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What's your email address?
              </label>
              <input
                type="email"
                name="email"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="johndoe@gmail.com"
                onChange={onHandleChange}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What's your Canadian phone number?
              </label>
              <input
                type="text"
                name="phone"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="E.g +1(647)234-5678"
                onChange={onHandleChange}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Where would the property be located?
              </label>
              <select
                name="location"
                onChange={onHandleChange}
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
              >
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Uyo</option>
                <option>Port-Harcourt</option>
                <option>Enugu</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                When do you want this property?
              </label>
              <input
                type="date"
                name="date"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="E.g +1(647)234-5678"
                onChange={onHandleChange}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                How much is the property?
              </label>
              <CurrencyFormat
                thousandSeparator={true}
                prefix={"CA$"}
                onValueChange={(values) => {
                  setData({ ...data, amount: values?.value });
                }}
                name="amount"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="50,000 CAD"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Available down payment
              </label>
              <CurrencyFormat
                thousandSeparator={true}
                prefix={"CA$"}
                onValueChange={(values) => {
                  setData({ ...data, downPayment: values?.value });
                }}
                name="amount"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="50,000 CAD"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What's your Canadian status?
              </label>
              <select
                name="canadianStatus"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                onChange={onHandleChange}
              >
                <option>Permanent Resident</option>
                <option>Citizen</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                How long have you been in canada?
              </label>
              <input
                type="text"
                name="durationInCanada"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="Please enter this is years"
                onChange={onHandleChange}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What’s your credit score?
              </label>
              <input
                type="text"
                name="creditScore"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="e.g 56.88"
                onChange={onHandleChange}
              />
            </div>
          </div>

          <div className="w-full mt-6">
            <button
              onClick={onHandleSubmit}
              className={`${isDisabled || loading ? "bg-slate-300" : "bg-main"} w-full py-4  rounded-lg text-white font-body-bold`}
              disabled={isDisabled || loading}
            >
              {loading ? "Saving information..." : "Join our waitlist"}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default WaitlistReactForm;