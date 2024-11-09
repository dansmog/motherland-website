import { useEffect, useState } from "react";
import CurrencyFormat from "react-currency-format";
import { debounce } from "lodash";
import { getCurrencySymbol, PrimeByCountry } from "../scripts/utils";

const ReactCalc = () => {
  const [data, setData] = useState({
    time: "",
    amount: "",
    downPayment: "",
    amortization: "",
    propertyAmount: "",
  });
  const [paybackAmount, setPaybackAmount] = useState(0);
  const [loan, setLoan] = useState(0);
  const [error, setError] = useState({
    downpaymentError: "",
    amortizationError: "",
  });
  const [inputValues, setInputValues] = useState({
    downPayment: "",
    amortization: "",
  });
  const [country, setCountry] = useState("canada");

  const PRIME_RATE = Number(PrimeByCountry[country.toLowerCase()]);
  const INTEREST_RATE = PRIME_RATE + import.meta.env.PUBLIC_MOTHERLAND_RATE;
  const MONTHS_IN_YEAR = 12;
  const BIWEEKLY_PERIODS_IN_YEAR = 26;

  // Debounced function to update the actual state
  const debouncedSetData = debounce((name, value) => {
    setError({
      downpaymentError: "",
      amortizationError: "",
    });

    if (name === "downPayment") {
      let numValue = parseFloat(value);
      if (numValue < 5) {
        setError((prev) => ({
          ...prev,
          downpaymentError: "Down payment cannot be less than 5%",
        }));
        return;
      }
      if (numValue > 90) {
        numValue = 90; // Remove the last digit if above 90
      }
      setData((prev) => ({ ...prev, downPayment: numValue.toString() }));
    } else if (name === "amortization") {
      let numValue = parseFloat(value);
      if (numValue < 5) {
        setError((prev) => ({
          ...prev,
          amortizationError: "Your amortization cannot be less than 5",
        }));
        return;
      }
      if (numValue > 15) {
        numValue = 15;
        setError((prev) => ({
          ...prev,
          amortizationError: "Your amortization cannot exceed 90",
        }));
      }
      setData((prev) => ({ ...prev, [name]: numValue }));
    }
  }, 250); // Faster debounce delay

  const onHandleChange = (event) => {
    const { name, value } = event.target;

    // Immediately update the input value for display
    setData((prev) => ({ ...prev, [name]: value }));

    // Debounce the actual state update and validation
    debouncedSetData(name, value);
  };

  useEffect(() => {
    if (
      data?.amortization &&
      data?.propertyAmount &&
      data?.downPayment &&
      data?.time
    ) {
      const downPaymentResult =
        (parseFloat(data?.downPayment) / 100) *
        parseFloat(data?.propertyAmount);

      const loanAvailable =
        parseFloat(data?.propertyAmount) - downPaymentResult;

      const monthlyRate = INTEREST_RATE / 100 / MONTHS_IN_YEAR;
      const numberOfPayments = parseFloat(data?.amortization) * MONTHS_IN_YEAR;

      const monthlyPayment =
        (loanAvailable *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      const biweeklyInterestRate =
        Math.pow(1 + monthlyRate, MONTHS_IN_YEAR / BIWEEKLY_PERIODS_IN_YEAR) -
        1;
      const totalBiweeklyPayments =
        parseFloat(data?.amortization) * BIWEEKLY_PERIODS_IN_YEAR;

      const biweeklyPayment =
        (loanAvailable *
          (biweeklyInterestRate *
            Math.pow(1 + biweeklyInterestRate, totalBiweeklyPayments))) /
        (Math.pow(1 + biweeklyInterestRate, totalBiweeklyPayments) - 1);

      if (error?.downpaymentError || error?.amortizationError) {
        return;
      } else {
        setPaybackAmount(
          data?.time === "monthly" ? monthlyPayment : biweeklyPayment
        );
        setLoan(loanAvailable);
      }
    }
  }, [data]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetData.cancel();
    };
  }, []);

  const onHandleCountryChange = (event) => {
    setCountry(event?.target.value);
  };

  console.log(parseFloat(data?.propertyAmount) > 50000);
  return (
    <form className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 w-full">
        <label className="font-body-medium text-sm text-[#666666]">
          Country of Residence?
        </label>
        <select
          name="countryOfResidence"
          onChange={onHandleCountryChange}
          className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
          defaultValue={country}
        >
          <option>Canada</option>
          <option>United states</option>
          <option disabled>United Kingdom</option>
          <option disabled>Europe</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-body-medium text-sm">
          How much is the property you want to purchase? (10k-50k)
        </label>

        <CurrencyFormat
          thousandSeparator={true}
          prefix={getCurrencySymbol(country)}
          onValueChange={(values) => {
            setData((prev) => ({ ...prev, propertyAmount: values?.value }));
          }}
          name="propertyAmount"
          className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
          placeholder={`50,000 ${getCurrencySymbol(country)}`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-body-medium text-sm">
          How much down payment in %? (5-90)
        </label>

        <input
          onChange={onHandleChange}
          value={data?.downPayment}
          name="downPayment"
          type="number"
          min="5"
          max="90"
          className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
          placeholder="10"
        />
        {parseFloat(data?.downPayment) >= 10 &&
        data?.downPayment &&
        data?.propertyAmount ? (
          <span className="font-body-bold text-xs text-black text-opacity-40">
            {`Down payment in ${getCurrencySymbol(country)}`}
            <CurrencyFormat
              thousandSeparator={true}
              prefix={getCurrencySymbol(country)}
              displayType="text"
              value={(
                (parseFloat(data?.downPayment) / 100) *
                parseFloat(data?.propertyAmount)
              ).toFixed(2)}
            />
          </span>
        ) : null}

        {error.downpaymentError && (
          <span className="text-red-500 text-sm font-body-medium">
            {error.downpaymentError}
          </span>
        )}

        {parseFloat(data?.propertyAmount) > 50000 &&
          parseFloat(data?.downPayment) < 10 && (
            <span className="text-red-500 text-sm font-body-medium">
              Property value &gt; 50k requires minimum of 10%
            </span>
          )}
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-body-medium text-sm">Interest rate</label>
          <input
            type="text"
            disabled
            className="w-full border-[1px] border-[#F3F3F3] py-3 px-5 rounded-lg text-sm font-body-medium"
            placeholder="10%"
            value={`Prime (${Number(PrimeByCountry[country.toLowerCase()])}) + ${import.meta.env.PUBLIC_MOTHERLAND_RATE}%`}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="font-body-medium text-sm">
            Amortization (5-15)
          </label>
          <input
            min={5}
            max={90}
            type="number"
            name="amortization"
            value={data?.amortization}
            className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
            placeholder="8"
            onChange={onHandleChange}
          />
          {error.amortizationError && (
            <span className="text-red-500 text-sm font-body-medium">
              {error.amortizationError}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full">
        <label className="font-body-medium text-sm">
          How would you like to pay back?
        </label>
        <div className="flex items-center gap-4 mt-2">
          <div
            className={`${data?.time === "monthly" ? "bg-main text-white" : "bg-slate-100 text-black"} text-base font-body-medium px-6 py-3 rounded-lg cursor-pointer`}
            onClick={() => setData((prev) => ({ ...prev, time: "monthly" }))}
          >
            Monthly
          </div>
          <div
            className={`${data?.time === "biweekly" ? "bg-main text-white" : "bg-slate-100 text-black"} text-base font-body-medium px-6 py-3 rounded-lg cursor-pointer`}
            onClick={() => setData((prev) => ({ ...prev, time: "biweekly" }))}
          >
            Bi-weekly
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 mt-5">
          <span className="font-body-medium text-sm">Total loan amount</span>
          {(loan &&
            parseFloat(data?.propertyAmount) > 50000 &&
            parseFloat(data?.downPayment) >= 10) ||
          (loan &&
            parseFloat(data?.propertyAmount) < 50000 &&
            parseFloat(data?.downPayment) >= 5) ? (
            <CurrencyFormat
              thousandSeparator={true}
              prefix={getCurrencySymbol(country)}
              displayType="text"
              value={loan.toFixed(2)}
              className="text-black text-opacity-70 font-body-bold text-2xl"
            />
          ) : (
            "Calculating..."
          )}
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <span className="font-body-medium text-sm">Payback amount</span>
          {(paybackAmount &&
            parseFloat(data?.propertyAmount) > 50000 &&
            parseFloat(data?.downPayment) >= 10) ||
          (loan &&
            parseFloat(data?.propertyAmount) < 50000 &&
            parseFloat(data?.downPayment) >= 5) ? (
            <CurrencyFormat
              thousandSeparator={true}
              prefix={getCurrencySymbol(country)}
              displayType="text"
              value={paybackAmount.toFixed(2)}
              className="text-black text-opacity-70 font-body-bold text-2xl"
            />
          ) : (
            "Calculating..."
          )}
        </div>
      </div>
    </form>
  );
};

export default ReactCalc;
