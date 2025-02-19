"use client";
import React from "react";
import {
  Table,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Framework } from "@superfluid-finance/sdk-core";
import { useEthersProvider } from "@/utils/WagmiEthersProvider";
import { useEthersSigner } from "@/utils/WagmiEthersSigner";
import { useContractRead } from "wagmi";
import Approve from "@/components/ApproveWeth";
import { useMyContext } from "@/app/AppContext";
import PayLoanAmount from "./PayLoanAmount";
import WithdrawPweth from "./WithdrawPweth";
import { Button } from "@/components/ui/button";
import { pweethyABI } from "@/utils/pweethy";
import { ethers } from "ethers";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
const Page = ({ params }: { params: { loanid: bigint } }) => {
  const { flagLoanpay } = useMyContext();

  const [payamount, setPayamount] = React.useState<number>(0);
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const { data, isError, isLoading, isSuccess } = useContractRead({
    address: "0xE6dD6265Eb872cEF38F969A9bF6a3f41626b0f46",
    abi: pweethyABI,
    functionName: "borrowers",
    args: [params.loanid],
  });
  const [LoadingFlag, setLoadingFlag] = React.useState(false);
  const [SuccessFlag, setSuccessFlag] = React.useState(false);
  React.useEffect(() => {
    console.log("fowesj");
  }, [data]);
  async function DeleteExistingFlow(recipient: string) {
    setLoadingFlag(true);

    try {
      if (signer != undefined) {
        const chainId = "420";
        const sf = await Framework.create({
          chainId: Number(chainId),
          provider: provider,
        });

        const superSigner = sf.createSigner({ signer: signer });

        console.log(signer);
        console.log(await superSigner.getAddress());
        const daix = await sf.loadSuperToken(
          "0xE01F8743677Da897F4e7De9073b57Bf034FC2433"
        );

        // console.log(daix);
        const ss = await signer.getAddress();
        const deleteFlowOperation = daix.deleteFlow({
          sender: await signer.getAddress(),
          receiver: recipient,
          // userData?: string
        });

        const result = await deleteFlowOperation.exec(superSigner);
        console.log(result);
        setSuccessFlag(true);
        return result;
      }
    } catch (error) {
      toast({
        title:
          "We are getting an error.  Check if you have any running Interest Stream or not ",
        variant: "destructive",
      });
      console.log(error);
      setLoadingFlag(false);
    }
  }

  if (isLoading) {
    return <div>Your Data is loading. Please Wait .....</div>;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        We got some error ........
      </div>
    );
  }

  if (isSuccess && data) {
    const disbursTime = new Date(Number(data[5]) * 1000);
    const ExpireTime = new Date(Number(data[6]) * 1000);
    return (
      <div className="h-[100vh] flex justify-center pt-[7%]">
        <div className=" border-solid p-4 border-2 border-white rounded-2xl min-w-[60%] flex justify-center items-center flex-col">
          <div className="flex justify-center  text-3xl font-bold">
            Loan Details
          </div>
          <Table>
            <TableRow>
              <TableCell colSpan={3}>Borrower</TableCell>
              <TableCell className="text-right">
                {`${data[0].slice(0, 4)}....${data[0].slice(
                  data[0].length - 4,
                  data[0].length
                )}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Loan Payable Address</TableCell>
              <TableCell className="text-right">
                {`${data[4].slice(0, 4)}....${data[4].slice(
                  data[0].length - 4,
                  data[0].length
                )}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Colateral Amount</TableCell>
              <TableCell className="text-right">
                {`${ethers.utils.formatEther(data[1].toString())} pWETH`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Loan Amount</TableCell>
              <TableCell className="text-right">
                {`${ethers.utils.formatEther(data[2].toString())} WETH`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Loan Amount Paid</TableCell>
              <TableCell className="text-right">
                {`${ethers.utils.formatEther(data[3].toString())}/WETH`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Remaining Amount </TableCell>
              <TableCell className="text-right">
                {`${ethers.utils.formatEther(data[2] - data[3])}/weth`}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={3}>Loan Start Date </TableCell>
              <TableCell className="text-right">
                {`${disbursTime.toString().slice(4, 25)}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>Loan Expiry Date </TableCell>
              <TableCell className="text-right">
                {`${ExpireTime.toString().slice(4, 25)}`}
              </TableCell>
            </TableRow>
          </Table>
          <div className="mt-4 border-solid border-2 flex justify-around flex-col gap-4 w-[50%] p-3 rounded-lg border-blue-400">
            {data[3] >= data[2] ? (
              <>
                <WithdrawPweth loanId={params.loanid} />
                {!SuccessFlag ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      DeleteExistingFlow(data[4].toString());
                    }}
                  >
                    {!LoadingFlag
                      ? "Stop your Interest Stream. Loan is paid back in full ❤️"
                      : "Loading Wallet...."}
                  </Button>
                ) : (
                  <div className="bg-green-300 p-3 rounded-2xl">
                    Your Interest Stream has bee successfully stopped
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-2 w-fit ">
                <div>
                  <Button
                    onClick={(e) => {
                      setPayamount(
                        Number(
                          ethers.utils.formatEther(
                            (data[2] - data[3]).toString()
                          )
                        )
                      );
                    }}
                  >
                    Max
                  </Button>
                </div>
                <div className="w-[50%]">
                  <Input
                    placeholder="Please amount you want to pay"
                    type="number"
                    className="w-full"
                    value={payamount}
                    onChange={(e) => {
                      setPayamount(Number(e.target.value));
                      // BigInt(parseFloat(e.target.value) * 1000000000000000000)
                    }}
                  />
                </div>
                <div className="w-fit">
                  {!flagLoanpay ? (
                    <Approve
                      amount={BigInt(
                        parseInt(
                          (payamount * 1000000000000000000 + 1).toString()
                        )
                      )}
                    />
                  ) : (
                    <PayLoanAmount
                      amount={BigInt(
                        parseInt((payamount * 1000000000000000000).toString())
                      )}
                      loanid={params.loanid}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      Please refresh the Page if page is blank
    </div>
  );
};

export const runtime = "edge";
export default Page;
