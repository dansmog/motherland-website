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
      const numValue = parseFloat(value);
      if (numValue < 5) {
        setError((prev) => ({
          ...prev,
          downpaymentError: "Down payment cannot be less than 5%",
        }));
        return;
      }
      if (numValue > 90) {
        setError((prev) => ({
          ...prev,
          downpaymentError: "Down payment cannot exceed 90%",
        }));
        return;
      }
      setData((prev) => ({ ...prev, [name]: value }));
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
  }, 500); // 500ms delay

  const onHandleChange = (event) => {
    const { name, value } = event.target;

    // Immediately update the input value for display
    setInputValues((prev) => ({ ...prev, [name]: value }));

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

      const principal = loanAvailable - downPaymentResult;
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
          value={inputValues.downPayment}
          name="downPayment"
          className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium"
          placeholder="10"
        />
        {data?.downPayment ? (
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
      <div className="">
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
          <span className="text-base font-body-medium">
            Total Loan available
          </span>
          <span className="text-2xl font-body-bold text-main">
            <CurrencyFormat
              thousandSeparator={true}
              prefix={"CA$"}
              displayType="text"
              value={loan.toFixed(2)}
              name="amount"
            />
          </span>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <span className="text-base font-body-medium">
            Total amount to repay{" "}
            {data?.time === "biweekly" ? "Bi-weekly" : data?.time}
          </span>
          <span className="text-2xl font-body-bold text-main">
            <CurrencyFormat
              thousandSeparator={true}
              prefix={"CA$"}
              displayType="text"
              value={paybackAmount.toFixed(2)}
              name="amount"
            />
          </span>
        </div>
      </div>
    </form>
  );
};

export default ReactCalc;
