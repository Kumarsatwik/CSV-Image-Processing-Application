const handleWebhook = async (req, res) => {
  try {
    console.log(`Webhook received for request ${req.body.requestId}`);
    console.log("webhook data ", req.body);

    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

module.exports = {
  handleWebhook,
};
