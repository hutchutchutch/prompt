// Example data for the LLM task showcase
export const examplePrompts = {
  classification: {
    promptText: "Classify the sentiment of the following customer feedback as positive, negative, or neutral: 'I was initially hesitant about the product, but after using it for a month, I'm impressed with how well it works. The customer service could be more responsive though.'",
    taskCategory: "Classification",
    businessValue: {
      description: "Automatically categorize thousands of customer reviews and support tickets to prioritize responses and identify product issues before they escalate. Our e-commerce clients use sentiment classification to route feedback to appropriate teams.",
      metric: "Reduces customer churn by 23% through faster issue resolution"
    },
    bestQuality: {
      model: "GPT-4",
      provider: "OpenAI",
      score: 9.2,
      cost: 0.00325,
      time: 872,
      output: "Classification: Positive\n\nJustification: The feedback expresses initial hesitation that was overcome by satisfaction with the product's performance over time. While there is a constructive criticism about customer service responsiveness, the overall sentiment is positive as the customer explicitly states they are 'impressed' with the product's functionality."
    },
    bestValue: {
      model: "Claude 3 Haiku",
      provider: "Anthropic",
      score: 8.7,
      cost: 0.00073,
      time: 512,
      output: "Sentiment: Positive\n\nWhile the feedback contains a negative element about customer service, the dominant sentiment is positive. The customer overcame initial hesitation and explicitly states they're 'impressed' with the product's performance, which indicates an overall positive sentiment."
    },
    fastest: {
      model: "Mistral-7B-Instruct",
      provider: "Mistral AI",
      score: 8.1,
      cost: 0.00018,
      time: 227,
      output: "The sentiment of this customer feedback is mixed, but leans positive. The customer expresses initial hesitation but ultimately is 'impressed' with the product's performance, which is a positive sentiment. However, they also mention a negative aspect about customer service responsiveness. Since the primary focus is on being impressed with the product, I would classify this as POSITIVE overall."
    }
  },
  
  entityExtraction: {
    promptText: "Extract all named entities (people, organizations, locations, dates) from the following text: 'On April 15, 2023, Dr. Sarah Johnson from Stanford University presented her research on climate change at the UN Climate Summit in Geneva, Switzerland. The research was funded by the National Science Foundation.'",
    taskCategory: "Entity Extraction",
    businessValue: {
      description: "Automatically extract and organize key information from thousands of research papers, news articles, and legal documents to build searchable knowledge bases and identify trends. Healthcare companies use this to track clinical research developments.",
      metric: "Reduces research time by 78% and increases discovery of relevant connections by 42%"
    },
    bestQuality: {
      model: "GPT-4",
      provider: "OpenAI",
      score: 9.7,
      cost: 0.00293,
      time: 951,
      output: "People:\n- Dr. Sarah Johnson\n\nOrganizations:\n- Stanford University\n- UN Climate Summit\n- National Science Foundation\n\nLocations:\n- Geneva\n- Switzerland\n\nDates:\n- April 15, 2023"
    },
    bestValue: {
      model: "Claude 3 Sonnet",
      provider: "Anthropic",
      score: 9.4,
      cost: 0.00128,
      time: 639,
      output: "Entities extracted:\n\nPeople:\n- Dr. Sarah Johnson\n\nOrganizations:\n- Stanford University\n- UN Climate Summit\n- National Science Foundation\n\nLocations:\n- Geneva\n- Switzerland\n\nDates:\n- April 15, 2023"
    },
    fastest: {
      model: "Gemini 1.0 Pro",
      provider: "Google",
      score: 8.9,
      cost: 0.00086,
      time: 318,
      output: "People: Dr. Sarah Johnson\nOrganizations: Stanford University, UN Climate Summit, National Science Foundation\nLocations: Geneva, Switzerland\nDates: April 15, 2023"
    }
  },
  
  summarization: {
    promptText: "Summarize the following academic abstract in 2-3 sentences using simple language that a high school student could understand:\n\n'This paper presents a novel approach to quantum error correction using topological codes. We demonstrate a fault-tolerant protocol that achieves an error threshold of 1% using only nearest-neighbor interactions on a 2D lattice. Our numerical simulations show that this approach outperforms surface codes by a factor of 2-3 in resource requirements while maintaining comparable error suppression capabilities.'",
    taskCategory: "Summarization",
    businessValue: {
      description: "Transform lengthy reports, articles, and transcripts into clear, concise takeaways. Financial services firms use summarization to digest quarterly earnings calls and extract key insights from market reports at scale.",
      metric: "Increases analyst productivity by 35% and improves information retention by 64%"
    },
    bestQuality: {
      model: "GPT-4 Turbo",
      provider: "OpenAI",
      score: 9.3,
      cost: 0.00178,
      time: 634,
      output: "This research introduces a new way to fix errors in quantum computers using special mathematical patterns called topological codes. The researchers created a method that can handle up to 1% error rate while only needing interactions between nearby components, making it more practical to build. Their computer simulations show this approach needs only about half the resources of previous methods while being just as good at preventing errors."
    },
    bestValue: {
      model: "Claude 3 Haiku",
      provider: "Anthropic",
      score: 9.0,
      cost: 0.00052,
      time: 398,
      output: "These scientists have created a better way to correct errors in quantum computers using a special pattern-based approach. Their method works with components that only talk to their neighbors and can handle mistakes up to 1% of the time. It's also more efficient, needing only about a third of the resources compared to previous methods while being equally effective."
    },
    fastest: {
      model: "Gemini 1.0 Pro",
      provider: "Google",
      score: 8.4,
      cost: 0.00073,
      time: 273,
      output: "This research created a new way to fix errors in quantum computers that only requires interactions between neighboring components. Their method can handle errors up to 1% of the time and uses half the resources of previous approaches while being just as effective at preventing errors."
    }
  },
  
  documentation: {
    promptText: "Write a clear, concise docstring for the following Python function:\n\n```python\ndef fetch_weather_data(location, date=None, units='metric', include_hourly=False):\n    \"\"\"[Your docstring here]\"\"\"\n    base_url = 'https://api.weatherservice.com/v2/'\n    \n    params = {\n        'location': location,\n        'units': units,\n        'include_hourly': str(include_hourly).lower()\n    }\n    \n    if date is not None:\n        params['date'] = date.strftime('%Y-%m-%d')\n    \n    response = requests.get(base_url, params=params)\n    response.raise_for_status()\n    \n    return response.json()\n```",
    taskCategory: "Documentation",
    businessValue: {
      description: "Generate comprehensive technical documentation for software at scale, improving code readability and maintenance efficiency. Software development teams use this to automatically document APIs and create developer guides for complex systems.",
      metric: "Reduces documentation time by 82% and increases developer onboarding speed by 47%"
    },
    bestQuality: {
      model: "GPT-4",
      provider: "OpenAI",
      score: 9.6,
      cost: 0.00214,
      time: 692,
      output: "```python\ndef fetch_weather_data(location, date=None, units='metric', include_hourly=False):\n    \"\"\"\n    Retrieves weather data from the weather service API.\n    \n    Parameters:\n        location (str): Location identifier (city name, coordinates, etc.)\n        date (datetime, optional): Date for which to retrieve weather data. \n                                 If None, returns current weather. Default is None.\n        units (str, optional): Unit system for the returned data ('metric' or 'imperial'). \n                              Default is 'metric'.\n        include_hourly (bool, optional): Whether to include hour-by-hour forecast. \n                                       Default is False.\n    \n    Returns:\n        dict: JSON response containing the requested weather data.\n        \n    Raises:\n        HTTPError: If the API request fails.\n    \"\"\"\n```"
    },
    bestValue: {
      model: "Claude 3 Haiku",
      provider: "Anthropic",
      score: 9.2,
      cost: 0.00068,
      time: 421,
      output: "```python\ndef fetch_weather_data(location, date=None, units='metric', include_hourly=False):\n    \"\"\"\n    Fetch weather data from the weather service API.\n    \n    Args:\n        location (str): Location identifier for the weather data.\n        date (datetime, optional): Specific date for weather data. If None, returns current weather.\n        units (str, optional): Unit system for measurements ('metric' or 'imperial'). Defaults to 'metric'.\n        include_hourly (bool, optional): Whether to include hourly forecast data. Defaults to False.\n    \n    Returns:\n        dict: Weather data in JSON format.\n        \n    Raises:\n        requests.HTTPError: If the API request fails.\n    \"\"\"\n```"
    },
    fastest: {
      model: "Mixtral-8x7B",
      provider: "Mistral AI",
      score: 8.8,
      cost: 0.00042,
      time: 302,
      output: "```python\ndef fetch_weather_data(location, date=None, units='metric', include_hourly=False):\n    \"\"\"\n    Fetch weather data from the weather service API.\n    \n    Parameters:\n        location (str): The location to get weather data for\n        date (datetime, optional): The date for which to fetch weather data. If None, fetches current weather.\n        units (str, optional): Unit system to use - 'metric' or 'imperial'. Defaults to 'metric'.\n        include_hourly (bool, optional): Whether to include hourly forecasts. Defaults to False.\n    \n    Returns:\n        dict: JSON response containing the weather data\n    \n    Raises:\n        HTTPError: If the API request fails\n    \"\"\"\n```"
    }
  },
  
  explanation: {
    promptText: "Explain how CRISPR gene editing technology works in simple terms, as if you were explaining it to a curious 12-year-old.",
    taskCategory: "Explanation & Commentary",
    businessValue: {
      description: "Create engaging educational content and customer support materials that simplify complex concepts. Educational technology companies use this to develop learning modules that increase student comprehension of difficult subjects.",
      metric: "Improves learning outcomes by 31% and reduces customer support inquiries by 55%"
    },
    bestQuality: {
      model: "GPT-4",
      provider: "OpenAI",
      score: 9.5,
      cost: 0.00285,
      time: 743,
      output: "Imagine your body's instruction manual is written in a special alphabet code called DNA. Sometimes there are spelling mistakes in this manual that can cause problems.\n\nCRISPR is like a super cool find-and-replace tool for this DNA instruction manual. It has two main parts:\n\n1. A \"guide\" that's like a search function - it can find the exact spot in the instruction manual that has a mistake\n\n2. \"Scissors\" (an enzyme called Cas9) that can cut the DNA at that exact spot\n\nOnce CRISPR cuts the DNA at the mistake, your cells try to repair it. Scientists can help this repair by providing a corrected version of the instructions.\n\nIt's a bit like if you were using a word processor, and you could search for a misspelled word, cut it out, and then paste in the correct spelling!\n\nScientists use CRISPR to fix genetic diseases, create better crops, and even develop new treatments for illnesses that were once considered incurable. It's like having an eraser and pencil for the code of life!"
    },
    bestValue: {
      model: "Claude 3 Sonnet",
      provider: "Anthropic",
      score: 9.2,
      cost: 0.00098,
      time: 513,
      output: "Imagine your body is like a huge library full of instruction books that tell your cells how to work. These instructions are written in DNA, which is like a special alphabet with only four letters: A, T, G, and C.\n\nSometimes, there's a typo or mistake in these instructions that can make you sick. CRISPR is like a super-precise library robot that can find and fix these mistakes.\n\nHere's how CRISPR works:\n\n1. First, scientists create a special guide (like a library catalog card) that matches the specific spot in the DNA where the mistake is.\n\n2. Then, the CRISPR system uses this guide to find that exact spot in the DNA.\n\n3. When it finds the spot, CRISPR uses molecular scissors (called Cas9) to cut the DNA strand right at the mistake.\n\n4. After cutting, the cell tries to repair the break. During this repair, scientists can trick the cell into adding a corrected version of the instructions.\n\nIt's kind of like using the find-and-replace function on a computer, but for the code that makes up all living things! Scientists are using CRISPR to try to cure genetic diseases, create better crops, and even fight against infections."
    },
    fastest: {
      model: "Gemini 1.0 Pro",
      provider: "Google",
      score: 8.8,
      cost: 0.00067,
      time: 287,
      output: "Okay, imagine your body is built following instructions written in a language called DNA. These instructions tell your body how to grow, what color your eyes should be, and basically everything about you!\n\nSometimes, there might be a mistake in these instructions that could cause problems. CRISPR is like a special tool that scientists can use to edit these instructions.\n\nHere's how it works:\n\n1. First, scientists create a \"guide\" that knows exactly where to find the mistake in the DNA instructions - like using the find feature on a computer.\n\n2. Then, CRISPR uses special \"scissors\" (called Cas9) that can cut the DNA at that exact spot.\n\n3. Once it's cut, scientists can either:\n   - Remove the mistake\n   - Fix the mistake by adding the correct instructions\n   - Or sometimes add completely new instructions\n\n4. Your cells will then repair the cut, keeping the changes the scientists made.\n\nIt's kind of like if you were writing a story and made a spelling mistake - CRISPR helps find the mistake, cut it out, and replace it with the correct spelling!\n\nScientists are using CRISPR to try to fix diseases caused by DNA mistakes and make other helpful changes to plants and animals."
    }
  }
};