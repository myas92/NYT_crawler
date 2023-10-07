function getConfigWP(url, category, data) {
    return {
        method: 'post',
        url: url,
        headers: {
            'Game-name': category,
            'Authorization': process.env.SPEEADREADINGS_PASSWORD,
            'Content-Type': 'application/json'
        },
        data: data
    };
}

module.exports = {
    getConfigWP
}