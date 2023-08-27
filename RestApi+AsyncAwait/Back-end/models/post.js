const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
}, { //2번째 매개변수는 schema에 대한 설정
    timestamps: true //객체가 추가될 때마다 mongoose가 자동으로 타임스탬프를 추가함
});

module.exports = mongoose.model('Post', postSchema);