import React, { useState, useEffect } from "react";
import { Vertical } from "../../utils/AnimatedPage";
import { useDispatch } from "react-redux";

export default function NFC() {
  const dispatch = useDispatch();

  const handleWriteNFC = async () => {
    alert("User clicked write button");
    try {
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [
          {
            recordType: "url",
            data: "https://chat.zalo.me/",
          },
        ],
      });

      alert("> Message written");
    } catch (error) {
      alert("Argh! Cannot read data from the NFC tag. Try another one?");
    }
  };

  return (
    <Vertical>
      <form></form>
      <h1>Cấp thẻ NFC</h1>
      <button onClick={handleWriteNFC} id="btn_write">
        Write NFC
      </button>
    </Vertical>
  );
}
