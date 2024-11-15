import { useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

export const validateEmail = (email) => {
  // Regular expression for validating an email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const PartnershipReactForm = () => {
  const [data, setData] = useState({
    businessName: "",
    businessAddress: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    contactPersonRole: "",
    message: "",
    partnershipRole: "⁠Developer",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const onHandleChange = (event) => {
    const { name, value } = event.target;
    setData({
      ...data,
      [name]: value,
    });

    if (name === "contactPersonEmail") {
      setErrors({
        ...errors,
        email: validateEmail(value) ? "" : "Please enter a valid email",
      });
    }
  };

  const onPhoneChange = (value) => {
    setData({
      ...data,
      contactPersonPhone: value,
    });
  };

  const onHandleSubmit = async () => {
    setLoading(true);
    const payload = { ...data };
    try {
      const response = await fetch(
        "https://hooks.zapier.com/hooks/catch/4886427/21xg822/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      window.alert("Failed to join, please try again");
    }
  };

  let isEmailError = errors?.email?.includes("Please enter a valid email");

  const isDisabled =
    !data?.businessName.length ||
    !data?.businessAddress.length ||
    !data?.contactPersonEmail.length ||
    !data?.contactPersonPhone?.length ||
    !data?.contactPersonRole.length ||
    !data?.message.length ||
    !data?.partnershipRole.length;

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
                fill="#fff"
              ></path>
            </svg>
          </span>
          <h1 className="font-body-bold text-xl mt-5 text-center">
            We do more together.
          </h1>
          <p className="text-base font-body-medium mt-4 text-center  max-w-96 mx-auto md:pb-14">
            Thank you for indicating interest to partner with us as a/an . Our
            team will connect with you on next steps.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Business name?
              </label>
              <input
                type="text"
                name="businessName"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="Canadian realtors construction"
                onChange={onHandleChange}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Business Address?
              </label>
              <input
                type="text"
                name="businessAddress"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="105 business address street"
                required
                onChange={onHandleChange}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Contact person email?
              </label>
              <input
                type="email"
                name="contactPersonEmail"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="E.g Blessing Ebong"
                required
                onChange={onHandleChange}
              />

              {errors.email && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Contact person phone number?
              </label>
              <PhoneInput
                name="contactPersonPhone"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="Enter phone number"
                value={data?.contactPersonPhone}
                onChange={onPhoneChange}
                defaultCountry="CA"
                countries={["CA", "GB", "US"]}
              />
              {errors.phone && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Contact person role?
              </label>
              <input
                type="text"
                name="contactPersonRole"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="CEO"
                onChange={onHandleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full mt-4">
            <label className="font-body-medium text-sm text-[#666666]">
              Partner with us as:
            </label>
            <select
              name="partnershipRole"
              onChange={onHandleChange}
              className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
            >
              <option>⁠Developer</option>
              <option>⁠Private Investor</option>
              <option>⁠Corporate Lender</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Message
              </label>
              <textarea
                name="message"
                className="w-full h-40 border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="leave a message"
                onChange={(event) =>
                  setData({ ...data, message: event.target.value })
                }
              />
            </div>
          </div>

          <div className="w-full mt-6">
            <button
              onClick={onHandleSubmit}
              className={`${isDisabled || loading ? "bg-slate-300" : "bg-main"} w-full py-4  rounded-lg text-white font-body-bold`}
              disabled={isDisabled || isEmailError || loading}
            >
              {loading ? "Saving information..." : "Become a partner"}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default PartnershipReactForm;
