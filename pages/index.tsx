import { FC, useCallback, useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import nlp from "compromise";

import { WordCloud } from "../components/word-cloud";
import { Bubbles } from "../components/bubbles";

const Index: FC = () => {
  const [data, setData] = useState(null);
  const [kind, setKind] = useState("cloud");

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");

      reader.onload = () => {
        setData(reader.result);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const computed = useMemo(() => {
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);

    const words = parsed.messages
      .map(({ content }) => content)
      .filter((v) => !!v)
      .map((mensaje) => nlp(mensaje).text("normal"))
      .map((mensaje) => nlp(mensaje).terms().json())
      .flat()
      .map(({ text }) => text)
      .reduce((words, word) => {
        word = removePunctuation(word);
        if (word && !words[word]) {
          words[word] = 0;
        }
        words[word]++;
        return words;
      }, {});

    return Object.keys(words).map((word) => ({
      name: word,
      value: words[word],
    }));
  }, [data]);

  if (!computed) {
    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <h1>Facebook messages word cloud</h1>
        <ol>
          <li>
            Go to facebook &gt; settings &gt; your facebook information &gt;
            Download your information
          </li>
          <li>At the top of the page, select JSON from the format dropdown</li>
          <li>On the right side of the page, click Deselect all.</li>
          <li>
            Select Messages and then click Create file at the top of the page.
          </li>
          <li>
            Wait for a notification from facebook then download and unzip your
            data
          </li>
          <li>
            Click <b>here</b> to open a file browser and navigate to the
            messages directory{" "}
          </li>
          <li>
            From there open inbox &gt; conversation (name of person(s) and some
            random characters) &gt; message_1.json{" "}
          </li>
        </ol>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setKind(kind === "bubbles" ? "cloud" : "bubbles")}
        style={{ padding: 8, fontSize: "2em", float: "right" }}
      >
        {kind === "bubbles" ? "Bubbles" : "Word Cloud"}
      </button>
      {kind === "bubbles" ? (
        <Bubbles words={computed} />
      ) : (
        <WordCloud words={computed} />
      )}
    </>
  );
};

function removePunctuation(str: string): string {
  return str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/g, "");
}

export default Index;
