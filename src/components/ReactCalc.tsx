import { useEffect, useState } from "react"
import CurrencyFormat from 'react-currency-format';

const ReactCalc = () => {
  const [data, setData] = useState({ time: "", amount: "", downPayment: "", amortization: "" });
  const [paybackAmount, setPaybackAmount] = useState(0)

  const PRIME_RATE = 7.2;
  const INTEREST_RATE = PRIME_RATE + 4;



  const onHandleChange = (event) => {
    const { name, value, } = event.target;
    console.log(event.target.rawValue)
    setData({
      ...data,
      [name]: value
    })
  }

  useEffect(() => {
    if (data?.amortization && data?.amount && data?.downPayment && data?.time) {
      const principal = parseFloat(data?.amount) - parseFloat(data?.downPayment);
  const monthlyRate = INTEREST_RATE / 100 / 12;
  const numberOfPayments = parseFloat(data?.amortization) * 12;


  const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const yearlyPayment = monthlyPayment * 12;
      const totalPayment = monthlyPayment * numberOfPayments;
      
      setPaybackAmount(data?.time === 'monthly' ? monthlyPayment : yearlyPayment)

  }
  }, [data])


  return (
    <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-body-medium text-sm">How much would you like to borrow?</label>
        
        <CurrencyFormat thousandSeparator={true} prefix={'CA$'} onValueChange={(values) => {
          setData({...data, amount: values?.value})
        }}  name="amount" className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium" placeholder="50,000 CAD"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-body-medium text-sm">How much down payment?</label>
       
        
  <CurrencyFormat thousandSeparator={true} prefix={'CA$'} onValueChange={(values) => {
          setData({...data, downPayment: values?.value})
        }}  name="downPayment" className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium" placeholder="50,000 CAD"/>

          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-col gap-2 w-full">
            <label className="font-body-medium text-sm">Interest rate</label>
            <input type="text" disabled className="w-full  border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium" placeholder="10%" value="Prime + 4%"/>
          </div>
            <div className="flex flex-col gap-2 w-full">
            <label className="font-body-medium text-sm">Amortization</label>
          <input min={8} max={15} type="number" name="amortization" className="w-full border-[1px] border-[#F3F3F3] py-3 px-4 rounded-lg text-base font-body-medium" placeholder="8" onChange={onHandleChange} />
          </div>
          </div>

           <div className="flex flex-col w-full">
            <label className="font-body-medium text-sm">How would you like to pay back?</label>
            <div className="flex items-center gap-4 mt-2">
            <div className={`${data?.time === 'monthly'? "bg-main text-white" : "bg-slate-100 text-black"} text-base font-body-medium  px-6 py-3 rounded-lg cursor-pointer`}
              onClick={() => setData({...data, time: 'monthly'})}
            >
            Monthly
            </div>
              <div className={`${data?.time === 'yearly'? "bg-main text-white" : "bg-slate-100 text-black"} text-base font-body-medium  px-6 py-3 rounded-lg cursor-pointer`}   onClick={() => setData({...data, time: 'yearly'})}>Yearly</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-5">
        <span className="text-base font-body-medium">Total amount to repay {data?.time}</span>
        <span className="text-2xl font-body-bold text-main">CA$ {paybackAmount.toFixed(2)}</span>
          </div>
        </form>
  )
}

export default ReactCalc