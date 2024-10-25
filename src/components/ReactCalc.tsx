import { useEffect, useState } from "react";
import CurrencyFormat from "react-currency-format";
import { debounce } from "lodash";

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

  const PRIME_RATE = 7.2;
  const INTEREST_RATE = PRIME_RATE + 7.5;
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
        console.log({ numValue });
      }
      setData((prev) => ({ ...prev, downPayment: numValue.toString() }));
    } else if (name === "amortization") {
      const numValue = parseFloat(value);
      if (numValue < 5) {
        setError((prev) => ({
          ...prev,
          amortizationError: "Your amortization cannot be less than 5",
        }));
        return;
      }
      if (numValue > 90) {
        setError((prev) => ({
          ...prev,
          amortizationError: "Your amortization cannot exceed 90",
        }));
        return;
      }
      setData((prev) => ({ ...prev, [name]: value }));
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
    console.log({ data });
    if (
      data?.amortization &&
      data?.propertyAmount &&
      data?.downPayment &&
      data?.time
    ) {
      console.log("Data object:", data); // Debugging state values

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

      setPaybackAmount(
        data?.time === "monthly" ? monthlyPayment : biweeklyPayment
      );
      setLoan(loanAvailable);

      console.log({
        downPaymentResult,
        loanAvailable,
        monthlyPayment,
        biweeklyPayment,
        paybackAmount:
          data?.time === "monthly" ? monthlyPayment : biweeklyPayment,
      });
    }
  }, [data]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetData.cancel();
    };
  }, []);

  return (
    <form className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-body-medium text-sm">
          How much is the property you want to purchase?
        </label>

        <CurrencyFormat
          thousandSeparator={true}
          prefix={"CA$"}
          onValueChange={(values) => {
            setData((prev) => ({ ...prev, propertyAmount: values?.value }));
          }}
          name="propertyAmount"
          className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
          placeholder="50,000 CAD"
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
        {data?.downPayment && data?.propertyAmount ? (
          <span className="font-body-bold text-xs text-black text-opacity-40">
            Down payment in CA$:{" "}
            <CurrencyFormat
              thousandSeparator={true}
              prefix={"CA$"}
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
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-body-medium text-sm">Interest rate</label>
          <input
            type="text"
            disabled
            className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
            placeholder="10%"
            value="Prime + 7.5%"
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
            value={inputValues.amortization}
            className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
            placeholder="8"
            onChange={onHandleChange}
          />
        </div>
        {error.amortizationError && (
          <span className="text-red-500 text-sm font-body-medium">
            {error.amortizationError}
          </span>
        )}
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
          {loan ? (
            <CurrencyFormat
              thousandSeparator={true}
              prefix={"CA$"}
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
          {paybackAmount ? (
            <CurrencyFormat
              thousandSeparator={true}
              prefix={"CA$"}
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
