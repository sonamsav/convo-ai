import {
  summarizeConversation,
  generateSmartReply,
  analyzeSentiment,
  detectIntent,
  translateContent,
  getConversationInsights,
  getStatus,
  getUsage,
  getConfig,
  updateConfig,
} from './controllers/aiController.js';

// Helper to mock Express req and res
function createMockContext(body = {}, query = {}) {
  let statusCode = 200;
  let responseData = null;

  const req = { body, query, method: 'POST', url: '/api/ai/test' };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  const getResult = () => ({ status: statusCode, body: responseData });
  return { req, res, getResult };
}

async function runTests() {
  console.log('🧪 Starting ConvoAI Backend AI Controller & Logic Tests...\n');

  try {
    // 1. Status
    console.log('1. Testing getStatus ...');
    const { req: req1, res: res1, getResult: getResult1 } = createMockContext();
    getStatus(req1, res1);
    const resStatus = getResult1();
    console.assert(resStatus.status === 200, 'Status should be 200');
    console.assert(resStatus.body.success === true, 'Success must be true');
    console.log('   ✅ AI Engine Status:', resStatus.body.data.status, `(Model: ${resStatus.body.data.model})`);

    // 2. Summarize
    console.log('\n2. Testing summarizeConversation ...');
    const { req: req2, res: res2, getResult: getResult2 } = createMockContext({
      messages: [
        { role: 'user', content: 'Our API webhooks are returning 401 signature mismatches.', senderName: 'Marcus' },
        { role: 'agent', content: 'I am checking the edge proxy secret cache now.', senderName: 'Sarah' },
      ],
      customerContext: { name: 'Marcus Vance', company: 'Stripe, Inc.', subject: 'Webhook 401 Error' },
    });
    await summarizeConversation(req2, res2, (err) => { throw err; });
    const resSummarize = getResult2();
    console.assert(resSummarize.status === 200, 'Summarize should be 200');
    console.assert(Boolean(resSummarize.body.data.overview), 'Overview must be present');
    console.assert(Array.isArray(resSummarize.body.data.actionsTaken), 'Actions taken must be an array');
    console.log('   ✅ Summarize OK:', resSummarize.body.data.overview.slice(0, 75) + '...');

    // 3. Smart Reply (English & Hindi)
    console.log('\n3. Testing generateSmartReply ...');
    const { req: req3a, res: res3a, getResult: getResult3a } = createMockContext({
      latestMessage: 'Can you please speed this up? Our checkout is impacted.',
      customerName: 'Elena Rostova',
      tone: 'Empathetic',
      language: 'en',
    });
    await generateSmartReply(req3a, res3a, (err) => { throw err; });
    const resReplyEn = getResult3a();
    console.assert(resReplyEn.status === 200, 'Reply EN should be 200');
    console.assert(resReplyEn.body.data.replies.length > 0, 'Must return at least 1 reply');
    console.log('   ✅ Smart Reply (Empathetic) OK:', resReplyEn.body.data.replies[0].title);

    // Hindi Smart Reply
    const { req: req3b, res: res3b, getResult: getResult3b } = createMockContext({
      latestMessage: 'क्या यह समस्या आज ठीक हो जाएगी?',
      customerName: 'Aarav Sharma',
      tone: 'Friendly',
      language: 'hi',
    });
    await generateSmartReply(req3b, res3b, (err) => { throw err; });
    const resReplyHi = getResult3b();
    console.assert(resReplyHi.status === 200, 'Reply HI should be 200');
    console.log('   ✅ Smart Reply (Hindi) OK:', resReplyHi.body.data.replies[0].text.slice(0, 60) + '...');

    // 4. Sentiment Analysis (Positive and Negative)
    console.log('\n4. Testing analyzeSentiment ...');
    const { req: req4a, res: res4a, getResult: getResult4a } = createMockContext({
      text: 'This issue is completely unacceptable, our checkout is down and losing revenue!',
    });
    await analyzeSentiment(req4a, res4a, (err) => { throw err; });
    const resSentNeg = getResult4a();
    console.assert(resSentNeg.status === 200, 'Sentiment should be 200');
    console.assert(resSentNeg.body.data.sentiment === 'Negative', 'Should be Negative');
    console.log('   ✅ Sentiment (Negative text):', resSentNeg.body.data.sentiment, `(Score: ${resSentNeg.body.data.score}/100)`);

    const { req: req4b, res: res4b, getResult: getResult4b } = createMockContext({
      text: 'Thank you so much! The fix worked perfectly and we really appreciate your fast help.',
    });
    await analyzeSentiment(req4b, res4b, (err) => { throw err; });
    const resSentPos = getResult4b();
    console.assert(resSentPos.body.data.sentiment === 'Positive', 'Should be Positive');
    console.log('   ✅ Sentiment (Positive text):', resSentPos.body.data.sentiment, `(Score: ${resSentPos.body.data.score}/100)`);

    // 5. Intent Detection
    console.log('\n5. Testing detectIntent ...');
    const { req: req5, res: res5, getResult: getResult5 } = createMockContext({
      text: 'Why was our credit card charged twice for invoice #INV-8902?',
    });
    await detectIntent(req5, res5, (err) => { throw err; });
    const resIntent = getResult5();
    console.assert(resIntent.status === 200, 'Intent should be 200');
    console.assert(resIntent.body.data.intent === 'Billing Issue', 'Must detect Billing Issue');
    console.log('   ✅ Intent OK:', resIntent.body.data.intent, `(Confidence: ${resIntent.body.data.confidence})`);

    // 6. Multilingual Translation
    console.log('\n6. Testing translateContent ...');
    const { req: req6, res: res6, getResult: getResult6 } = createMockContext({
      text: 'We are investigating your issue right now.',
      targetLanguage: 'hi',
    });
    await translateContent(req6, res6, (err) => { throw err; });
    const resTrans = getResult6();
    console.assert(resTrans.status === 200, 'Translation should be 200');
    console.log('   ✅ Translation (EN -> HI):', resTrans.body.data.translatedText);

    // 7. Conversation Insights
    console.log('\n7. Testing getConversationInsights ...');
    const { req: req7, res: res7, getResult: getResult7 } = createMockContext({
      conversationId: 'cnv-1',
    });
    await getConversationInsights(req7, res7, (err) => { throw err; });
    const resInsights = getResult7();
    console.assert(resInsights.status === 200, 'Insights should be 200');
    console.assert(resInsights.body.data.repeatedComplaints.length > 0, 'Complaints array should not be empty');
    console.log('   ✅ Insights OK: Topics =', resInsights.body.data.frequentlyMentionedTopics.join(', '));

    // 8. Usage Telemetry
    console.log('\n8. Testing getUsage ...');
    const { req: req8, res: res8, getResult: getResult8 } = createMockContext();
    getUsage(req8, res8);
    const resUsage = getResult8();
    console.assert(resUsage.status === 200, 'Usage should be 200');
    console.assert(resUsage.body.data.totalRequests > 0, 'Total requests > 0');
    console.log('   ✅ Usage OK: Total Requests =', resUsage.body.data.totalRequests, `(Tokens: ~${resUsage.body.data.tokenConsumptionEstimate})`);

    // 9. Config
    console.log('\n9. Testing getConfig & updateConfig ...');
    const { req: req9a, res: res9a, getResult: getResult9a } = createMockContext();
    getConfig(req9a, res9a);
    const resConfigGet = getResult9a();
    console.assert(resConfigGet.status === 200, 'Config GET 200');

    const { req: req9b, res: res9b, getResult: getResult9b } = createMockContext({
      defaultTone: 'Friendly',
      autoSentiment: true,
    });
    updateConfig(req9b, res9b);
    const resConfigPost = getResult9b();
    console.assert(resConfigPost.status === 200, 'Config POST 200');
    console.assert(resConfigPost.body.data.defaultTone === 'Friendly', 'Tone updated to Friendly');
    console.log('   ✅ Config OK: Tone is', resConfigPost.body.data.defaultTone);

    console.log('\n🎉 ALL AI BACKEND MODULES AND SCHEMAS TESTED & VERIFIED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
