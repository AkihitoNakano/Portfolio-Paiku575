const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    cards: [
      {
        card: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Content',
        },
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
  },
  { timestamps: true }
)

// タグを追加またはlengthを増やす
tagSchema.statics.addTag = async (tags, cardId) => {
  if (tags.length < 1) return

  try {
    for (const tag of tags) {
      const result = await Tag.findOne({ name: tag })
      if (!result) {
        const newTag = await Tag.create({ name: tag })
        newTag.cards = newTag.cards.concat({ card: cardId })
        await newTag.save()
      } else {
        result.cards = result.cards.concat({ card: cardId })
        result.save()
      }
    }
  } catch (err) {
    console.log(err)
  }
}

const Tag = new mongoose.model('Tag', tagSchema)
module.exports = Tag
