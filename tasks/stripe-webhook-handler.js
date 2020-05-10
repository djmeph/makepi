module.exports = async (event) => {
    for (let i = 0; i < event.Records.length; i++) {
        await handler(event.Records[i]);
    }
};

async function handler(record) {
    console.log(record);
}
