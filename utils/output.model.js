function outputModel(qa_id, category, titleDate, fullDateFormat, questions_answers, board ="") {
    return {
        "qa_id": qa_id,
        'game-name': category,
        "title_date": titleDate,
        "date": fullDateFormat,
        "result": questions_answers,
        "board" : board
    }
}

module.exports = {
    outputModel
}