import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [sentences, setSentences] = useState([]); // State for sentences
  const [practicedIndices, setPracticedIndices] = useState([]); // State for practiced sentence indices
  const [currentSentence, setCurrentSentence] = useState(''); // State for current sentence
  const [translation, setTranslation] = useState(''); // State for user translation
  const [loading, setLoading] = useState(false); // State for loading status
  const [result, setResult] = useState(''); // State for API result
  const [currentIndex, setCurrentIndex] = useState(0); // State for current sentence index

  const handleNextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSentence(sentences[currentIndex + 1]); // Update current sentence
      setTranslation('')
      setResult({})
    }
  };
  useEffect(() => {
    // Load sentences from JSON file
    const loadSentences = async () => {
      const response = await fetch('/sentences.json');
      const data = await response.json();
      setSentences(data);
      setCurrentSentence(data[0]); // Set the first sentence as current

      // Initialize practiced indices from local storage
      const storedPracticed = JSON.parse(localStorage.getItem('practicedIndices')) || [];
      setPracticedIndices(storedPracticed);
    };
    loadSentences();
  }, []);

  const handleTranslationSubmit = async () => {
    setLoading(true); // Set loading to true when submission starts
    try {
      const prompt = `This is a translation practice from Chinese to English, revise it to get a higher band in IELTS writing.
      The Chinese sentence is: "${currentSentence}"
      and the translation is: "${translation}"
      Revise the sentence in three ways with tailwind style, 
      use "line-through" class to mark the deleted words, 
      use "text-green-500" class to mark the added words; 
      For example: This is a <span class="line-through">good</span> <span class="text-green-500">exceptional</span>work.
      mark both the origin translation(fill to the mark in return json) and the revised ones with IELTS standard(fill to mark_1 of the return json).
      return in JSON format, {"mark": 1-9, "mark_1": 1-9, "mark_2", "mark_3", "revised_sentence": "", "revised_sentence_2": "", "revised_sentence_3": ""}
      `;
      const response = await axios.post('https://openai.xiaopei0206.workers.dev', {
        prompt // Send the sentence as the prompt
      });
      setLoading(false)
      // const response = await axios.post('https://api.example.com/analyze', { translation });
      setResult(response.data); // Set the result from API

      // Store the current index in practiced indices after submission
      if (!practicedIndices.includes(currentIndex)) {
        const updatedPracticed = [...practicedIndices, currentIndex];
        setPracticedIndices(updatedPracticed);
        localStorage.setItem('practicedIndices', JSON.stringify(updatedPracticed)); // Save to local storage
      }
    } catch (error) {
      console.error("Error submitting translation:", error);
      setResult("Error: Unable to get a response."); // Handle error
    } finally {
      setLoading(false); // Set loading to false when submission ends
    }
  };

  return (
    <div className="h-screen overflow-hidden">
    <div className='text-center bg-green-100 p-4'>
      <h1 className="text-3xl font-bold mb-4">Improving IELTS Writing with translation</h1>
    </div>
    <div className=" flex">
      <div className="w-1/3 h-screen overflow-y-auto p-4 border-r border-gray-300 pb-20">
        <h2 className="text-xl font-bold mb-4">Sentences</h2>
        <ul>
          {sentences.map((sentence, index) => (
            <li key={index} 
              className={`p-2 hover:bg-gray-200 cursor-pointer ${currentIndex === index ? 'bg-blue-100' : ''} ${practicedIndices.includes(index) ? 'text-gray-500' : ''}`}
              onClick={() => {
                setCurrentSentence(sentence)
                setCurrentIndex(index)
              }} // Updated click handler
            >
              {sentence}
              <span className='float-right'>{practicedIndices.includes(index) ? '✅' : '⬜'}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 p-4">
        <h2 className="text-lg mb-2">Translate sentence into English:</h2>
        <p className="border p-2 mb-4">{currentSentence}</p>
        <textarea
          className="border p-2 w-full h-24 mb-4"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder="Enter your translation here..."
        />
        <button onClick={handleTranslationSubmit} className="bg-blue-500 text-white p-2" disabled={loading}>
          {loading ? 'Revise ...' : 'Revise'}
        </button>
        {/* {result && <div className="mt-4 p-2 border border-gray-300" dangerouslySetInnerHTML={{ __html: result }}/>} */}

        <table className="min-w-full border-collapse border border-gray-300 mt-4 text-left">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Type</th>
                <th className="border border-gray-300 p-2">Sentence</th>
                <th className="border border-gray-300 p-2">Mark</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Original</td>
                <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: translation }} />
                <td className={`border border-gray-300 p-2 ${result.mark >= 7 ? 'bg-green-200' : result.mark >= 5 ? 'bg-yellow-200' : 'bg-red-200'}`}>{result.mark}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Revised</td>
                <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: result.revised_sentence }} />
                <td className={`border border-gray-300 p-2 ${result.mark_1 >= 7 ? 'bg-green-200' : result.mark_1 >= 5 ? 'bg-yellow-200' : 'bg-red-200'}`}>{result.mark_1}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Revised 2</td>
                <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: result.revised_sentence_2 }} />
                <td className={`border border-gray-300 p-2 ${result.mark_1 >= 7 ? 'bg-green-200' : result.mark_1 >= 5 ? 'bg-yellow-200' : 'bg-red-200'}`}>{result.mark_2}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Revised 3</td>
                <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: result.revised_sentence_3 }} />
                <td className={`border border-gray-300 p-2 ${result.mark_1 >= 7 ? 'bg-green-200' : result.mark_1 >= 5 ? 'bg-yellow-200' : 'bg-red-200'}`}>{result.mark_3}</td>
              </tr>
              
            </tbody>
          </table>        
          <button onClick={handleNextSentence} className="bg-green-500 text-white mt-6 p-2" disabled={currentIndex >= sentences.length - 1}>
            Next
          </button>          
      </div>

    </div>
    </div>
  );
}

export default App;