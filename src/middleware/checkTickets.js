const checkTickets = async (req, res, next) => {
  try {
    if (!req.user) {
      next()
    }

    await req.user.populate('profile')
    let myTickets = req.user.profile[0].tickets
    const resetDate = req.user.profile[0].resetDate
      .toLocaleString()
      .split(' ')[0]

    const date = new Date()
    const currentDate = date.toLocaleString().split(' ')[0]

    if (resetDate === currentDate) {
      req.tickets = myTickets
      return next()
    }
    myTickets = await req.user.profile[0].resetTicketCount(date)

    // debug チケットが０になったら回復する
    // if (myTickets === 0) {
    //   myTickets = await req.user.profile[0].resetTicketCount()
    // }

    req.tickets = myTickets
    next()
  } catch (err) {
    console.log(err)
    next()
  }
}

module.exports = { checkTickets }
