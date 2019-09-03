function Shuffler(arr) {
  this.originalArr = arr;
  this.shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  this.shuffledArr = this.shuffle(this.originalArr.slice(0));
  this.nextItem = undefined;
  this.next = () => {
    this.nextItem = this.shuffledArr.shift();
    if (this.shuffledArr.length < 1) {
      this.shuffledArr = this.shuffle(this.originalArr.slice(0));
      while (this.nextItem === this.shuffledArr[0]) {
        this.shuffledArr = this.shuffle(this.originalArr.slice(0));
      }
    }
    return this.nextItem;
  };
}

export default Shuffler;
