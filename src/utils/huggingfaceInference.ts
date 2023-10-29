// huggingfaceInference.ts
import { HfInference } from '@huggingface/inference';

const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateText(input: string) {
    const generator = await Hf.textGenerationStream({
        model: 'oasst-sft-4-pythia-12b-epoch-3.5',
        inputs: input,
        parameters: {
            max_new_tokens: 200,
            repetition_penalty: 1,
            truncate: 1000,
        },
    });

    let generatedText = '';
    for await (const chunk of generator) {
        generatedText += chunk.generated_text;
    }

    return generatedText;
}
