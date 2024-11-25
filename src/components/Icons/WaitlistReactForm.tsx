import { useState } from "react";
import CurrencyFormat from "react-currency-format";
import { validateEmail } from "./PartnershipReactForm";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { getCurrencySymbol } from "../../scripts/utils";

import { Turnstile } from "@marsidev/react-turnstile";

const WaitlistReactForm = () => {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState({
    location: "Lagos",
    downPayment: "",
    budget: "",
    status: "Permanent resident",
    countryOfResidence: "Canada",
    fullName: "",
    email: "",
    creditScore: "",
    phone: "",
    date: "",
    durationInCountry: "",
    jobStatus: null,
    existingMortgage: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    durationInCountry: "",
    budget: "",
    downPayment: "",
    creditScore: "",
  });

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        return validateEmail(value) ? "" : "Please enter a valid email";

      case "creditScore":
        const creditScoreNum = parseFloat(value);
        return creditScoreNum > 0 && creditScoreNum <= 900
          ? ""
          : "Credit score must be between 0 and 900";

      case "budget":
        const budgetNum = parseFloat(value);
        return budgetNum > 0 && budgetNum <= 200000
          ? ""
          : "Budget must be between 0 and 200,000";

      case "downPayment":
        const downPaymentNum = parseFloat(value);
        const budgetValue = parseFloat(data.budget);
        return downPaymentNum >= 0 && downPaymentNum <= budgetValue
          ? ""
          : "Down payment cannot exceed budget";

      case "durationInCountry":
        const durationNum = parseFloat(value);
        return durationNum >= 0 && durationNum <= 80
          ? ""
          : "Duration in country must be between 0 and 80 years";

      default:
        return "";
    }
  };

  const onPhoneChange = (value) => {
    setData({
      ...data,
      phone: value,
    });
  };

  const onCurrencyChange = (name) => (values) => {
    const newData = {
      ...data,
      [name]: values.value,
    };
    setData(newData);

    // Validate the field
    const fieldError = validateField(name, values.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldError,
    }));
  };

  const onHandleChange = (event) => {
    const { name, value } = event.target;
    const newData = {
      ...data,
      [name]: value,
    };
    setData(newData);

    const fieldError = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldError,
    }));
  };

  console.log({ errors });

  const onHandleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      window.alert("Please complete the bot verification");
      return;
    }

    const newErrors = {};
    Object.keys(data).forEach((key) => {
      if (
        [
          "budget",
          "downPayment",
          "creditScore",
          "email",
          "durationInCountry",
        ].includes(key)
      ) {
        const error = validateField(key, data[key]);
        if (error) newErrors[key] = error;
      }
    });

    // If there are any errors, set them and prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...newErrors,
      }));
      return;
    }

    setLoading(true);
    const payload = { ...data, turnstileToken: token };

    const loanAvailable =
      parseFloat(data?.budget) - parseFloat(data?.downPayment);

    payload["loanAmount"] = loanAvailable;
    payload["type"] = "waitlist";

    try {
      const verificationResponse = await fetch(
        "https://api.motherland.homes/api/verify-turnstile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const verificationResult = await verificationResponse.json();

      console.log({ verificationResult });

      if (!verificationResult.success) {
        throw new Error("Bot verification failed");
      }

      const [zapierResponse, emailResponse] = await Promise.allSettled([
        fetch(
          "https://hooks.zapier.com/hooks/catch/4886427/2mi1ggt/",

          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        ),

        fetch("https://api.motherland.homes/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }),
      ]);

      const hasZapierError =
        zapierResponse.status === "rejected" || !zapierResponse?.value.ok;
      const hasEmailError =
        emailResponse.status === "rejected" || !emailResponse?.value.ok;

      if (hasZapierError || hasEmailError) {
        throw new Error("One or more submission endpoints failed");
      }

      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      window.alert("Failed to join, please try again");
      console.error(error.message);
    }
  };

  let isEmailError = errors?.email?.includes("Please enter a valid email");

  const isDisabled =
    !data?.location.length ||
    !data?.budget.length ||
    !data?.status.length ||
    !data?.downPayment.length ||
    !data?.fullName.length ||
    !data?.creditScore.length ||
    !data?.email.length ||
    !data?.phone.length ||
    !data?.durationInCountry.length ||
    !data?.jobStatus ||
    data?.jobStatus === null ||
    !data?.existingMortgage ||
    data?.existingMortgage === null ||
    !data?.date.length;

  return (
    <section className="w-full h-auto">
      {success ? (
        <div className="flex flex-col h-auto mt-36 justify-center items-center">
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
            We are thrilled to have you on board
          </h1>
          <p className="text-base font-body-medium mt-4 text-center  max-w-96 mx-auto md:pb-14">
            Your application is under review and our team will reach out to you
            for further details and next steps.
          </p>
        </div>
      ) : (
        <form>
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
              {errors.email && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Are you currently employed?
              </label>
              <div className="flex items-center gap-5">
                <label className="font-body-medium text-base flex gap-2">
                  <input
                    type="radio"
                    name="jobStatus"
                    value="Yes"
                    checked={data?.jobStatus === "Yes"}
                    onChange={onHandleChange}
                  />
                  Yes
                </label>

                <label className="font-body-medium text-base flex gap-2">
                  <input
                    type="radio"
                    name="jobStatus"
                    value="No"
                    checked={data?.jobStatus === "No"}
                    onChange={onHandleChange}
                  />
                  No
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What is your marital status?
              </label>
              <select
                name="maritalStatus"
                onChange={onHandleChange}
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
              >
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Single parent</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What's your phone number?
              </label>
              <PhoneInput
                name="phone"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="Enter phone number"
                value={data?.phone}
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
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Country of Residence?
              </label>
              <select
                name="countryOfResidence"
                onChange={onHandleChange}
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
              >
                <option>Canada</option>
                <option>United states</option>
                <option>United Kingdom</option>
                <option>Europe</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What's your status in {data?.countryOfResidence}?
              </label>
              <select
                name="status"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                onChange={onHandleChange}
              >
                <option>Permanent Resident</option>
                <option>Citizen</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                How long (in years) have you been in {data?.countryOfResidence}?
              </label>
              <input
                type="number"
                name="durationInCountry"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="Please enter number of years"
                onChange={onHandleChange}
              />
              {errors?.durationInCountry && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors?.durationInCountry}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Where are you looking to purchase a property?
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
                <option>Nairobi</option>
                <option>Accra</option>
                <option>Addis Ababa</option>
                <option>Cairo</option>
                <option>Pretoria</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                When are you looking to purchase the property?
              </label>
              <input
                type="date"
                name="date"
                className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="E.g +1(647)234-5678"
                onChange={onHandleChange}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                How much is your budget?
              </label>
              <CurrencyFormat
                thousandSeparator={true}
                prefix={getCurrencySymbol(data?.countryOfResidence)}
                onValueChange={onCurrencyChange("budget")}
                name="budget"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder={`50,000 ${getCurrencySymbol(data?.countryOfResidence)}`}
              />
              {errors.budget && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors.budget}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                How much do you have as down payment?
              </label>
              <CurrencyFormat
                thousandSeparator={true}
                prefix={getCurrencySymbol(data?.countryOfResidence)}
                onValueChange={onCurrencyChange("downPayment")}
                name="amount"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder={`50,000 ${getCurrencySymbol(data?.countryOfResidence)}`}
              />
              {errors.downPayment && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors.downPayment}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                What’s your current credit score?
              </label>
              <input
                type="number"
                maxLength={900}
                max={900}
                name="creditScore"
                className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
                placeholder="e.g 715"
                onChange={onHandleChange}
              />
              {errors.creditScore && (
                <span className="text-red-500 text-sm font-body-medium">
                  {errors.creditScore}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="font-body-medium text-sm text-[#666666]">
                Do you have an existing mortgage?
              </label>
              <div className="flex items-center gap-5">
                <label className="font-body-medium text-base flex gap-2">
                  <input
                    type="radio"
                    name="existingMortgage"
                    value="Yes"
                    checked={data?.existingMortgage === "Yes"}
                    onChange={onHandleChange}
                  />
                  Yes
                </label>

                <label className="font-body-medium text-base flex gap-2">
                  <input
                    type="radio"
                    name="existingMortgage"
                    value="No"
                    checked={data?.existingMortgage === "No"}
                    onChange={onHandleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <Turnstile
            siteKey="0x4AAAAAAA0E4xNNPLsnXO2N" // Your site key
            onSuccess={(token) => setToken(token)}
            options={{
              theme: "light",
            }}
          />
          <div className="w-full mt-6">
            <button
              onClick={onHandleSubmit}
              className={`${isDisabled || loading ? "bg-slate-300" : "bg-main"} w-full py-4  rounded-lg text-white font-body-bold`}
              disabled={isDisabled || isEmailError || loading}
              type="submit"
              value="Submit"
            >
              {loading ? "Loading please wait ..." : "Kick off my application"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default WaitlistReactForm;
