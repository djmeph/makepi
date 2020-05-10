module.exports = async (event) => {
    for (let i = 0; i < event.Records.length; i++) {
        await handler(JSON.parse(event.Records[i].body));
    }
};

async function handler(record) {
    console.log(record);
}
