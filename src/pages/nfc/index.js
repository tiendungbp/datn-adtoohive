import React, { useState } from "react";
import { Vertical } from "../../utils/AnimatedPage";
import { useDispatch } from "react-redux";

export default function NFC() {
//   const dispatch = useDispatch();
//   const [id,setid] = useState(0)
  const handleWriteNFC = async () => {

    // alert("User clicked write button");
    // // I want to write a URL to the NFC
    // try {
    //   const ndef = new NDEFReader();

    //   await ndef.write({
    //     records: [
    //       {
    //         recordType: "url",
    //         data: "https://www.youtube.com/shorts/YTvUC3bIRpY",
    //       },
    //     ],
    //   });

    //   alert("> Message written");
    // } catch (error) {
    //   alert("Argh! Cannot read data from the NFC tag. Try another one?");
    // }
  };

  return (
    <Vertical>
      <form></form>
      <h1>Cấp thẻ NFC</h1>
      <button
        onClick={handleWriteNFC}
        id="btn_write"
      >
        Write NFC
      </button>
    </Vertical>
  );
}
