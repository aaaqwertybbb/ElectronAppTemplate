export class ByteList {
    bytes;
    capacity;
    count;

    constructor(initialCapacity: number) {
        // The Uint8Array avoids serialization during IPC
        this.bytes = new Uint8Array(initialCapacity);
        this.capacity = initialCapacity;
        this.count = 0;
    }

    /**
     * Does not clear the information, only sets 'this.count' to '0'.
     */
    clear() {
        this.count = 0;
    }

    /**
     * TODO: ensure all the parameters are encoded, especially because I'm noticing myself forgetting.
     */
    insert(index: number, byte: number) {
        this.ensureCapacityForInsertion(index, 1);

        if (index !== this.count) {
            this.copyTo(this.bytes, index, this.bytes, index + 1, this.count - index);
        }

        this.bytes[index] = byte;

        this.count++;
    }

    insertString(index: number, string: string, encoder: TextEncoder) {
        this.ensureCapacityForInsertion(index, string.length);

        if (index !== this.count) {
            this.copyTo(this.bytes, index, this.bytes, index + string.length, this.count - index);
        }

        const encodedBytes = encoder.encode(string);
        this.bytes.set(encodedBytes, index);

        this.count += string.length;
    }
    
    /**
     * @param {number} index 
     * @param {Uint8Array} incomingBs the incoming bytes, name avoids confusion with this.bytes
     * @param {number} offset the offset to begin reading from
     * @param {number} length the amount of bytes to read
     */
    insertBytes(index: number, incomingBs: Uint8Array, offset: number, length: number) {
        this.ensureCapacityForInsertion(index, length);

        if (index !== this.count) {
            this.copyTo(this.bytes, index, this.bytes, index + length, this.count - index);
        }

        for (var i = 0; i < length; i++) {
            this.bytes[index + i] = incomingBs[offset + i];
        }

        this.count += length;
    }

    /**
     * 
     * @param {number} sourceStart 
     * @param {number} destinationStart 
     * @param {number} length 
     */
    duplicateWithin(sourceStart: number, destinationStart: number, length: number) {

        if (sourceStart + length > destinationStart) {
            // TODO: This perhaps could result in the initial 'copyTo' step that creates space within the array, having clobbered the source.
            //
            // TODO: I'm gonna throw an error if 'sourceStart + length > destinationStart' that should let me do the simple duplicate case and then go from there.
            //
            // TODO: When copying text you only need to remember the positions maybe, and then if the user loses focus of the app...
            // ...only then would you need to create text from their selection in case they intend to paste to an external app...
            // ...otherwise paste could just be a copyWithin if copy and paste only occurs within the app itself?
            //
            throw new Error('TODO: sourceStart + length > destinationStart');
        }

        this.ensureCapacityForInsertion(destinationStart, length);

        if (destinationStart !== this.count) {
            this.copyTo(this.bytes, destinationStart, this.bytes, destinationStart + length, this.count - destinationStart);
        }

        this.copyTo(this.bytes, sourceStart, this.bytes, destinationStart, length);

        this.count += length;
    }

    /**
     * Does not clear trailing information.
     * 
     * count === 0 immediately returns
     */
    removeAt(index: number, count: number) {

        if (index > this.count) { throw new Error('removeAt(...): index > this.count'); }
        if (index + count > this.count) { throw new Error('removeAt(...): index + count > this.count'); }
        if (count === 0) { return; }

        if (index + count === this.count) {
            let shiftableCount = this.count - (index + count);
            if (shiftableCount > 0) {
                this.copyTo(
                    this.bytes,
                    index + count,
                    this.bytes,
                    index,
                    shiftableCount);
            }
        }
        else {
            this.copyTo(
                this.bytes,
                index + count,
                this.bytes,
                index,
                this.count - (index + count));
        }

        this.count -= count;
    }

    /**
     * - If the size asked for cannot be allocated, an exception will be thrown. (presumably the wording "thrown by the runtime" is involved.)
     * - JavaScript numbers do not wrap around to negative values when the value is very large.
     *       They instead approach infinity and lose precision.
     *       - There still is a check for whether the new, expected to be larger, capacity is smaller for whatever reason.
     *         Since this ought to be a negligible check for this method to perform.
     *         And failure to catch that case if it happens is an infinite loop.
     */
    ensureCapacityForInsertion(index: number, count: number) {
        let capacityPrevious = this.capacity;
        while (true) {
            if (this.count + count > this.capacity) {
                this.doubleCapacity();
            }
            else if (index >= this.capacity) {
                this.doubleCapacity();
            }
            else {
                break;
            }

            if (this.capacity === capacityPrevious) {
                break;
            }
            if (this.capacity < capacityPrevious) {
                throw new Error('ensureCapacityForInsertion(...): this.capacity < capacityPrevious');
            }

            capacityPrevious = this.capacity;
        }
    }

    doubleCapacity() {
        let capacityNew = this.capacity * 2;
        let bytesNew = new Uint8Array(capacityNew);
        this.copyTo(this.bytes, 0, bytesNew, 0, this.count);
        this.bytes = bytesNew;
        this.capacity = capacityNew;
    }

    /**
     * inclusive/exclusive
     */
    copyTo(bytesSource: Uint8Array, sourceStart: number, bytesDestination: Uint8Array, destinationStart: number, length: number) {

        if (bytesSource === bytesDestination) {
            if (bytesSource !== this.bytes) {
                throw new Error('bytesSource === bytesDestination ; but bytesSource !== this');
            }

            this.bytes.copyWithin(destinationStart, sourceStart, sourceStart + length);
        }
        else {
            // TODO: use 'set' method here and other such locations
            for (var i = 0; i < length; i++) {
                bytesDestination[destinationStart + i] = bytesSource[sourceStart + i];
            }
        }
    }
}

export class UInt32List {
    data;
    capacity;
    count;

    constructor(initialCapacity: number) {
        this.data = new Uint32Array(initialCapacity);
        this.capacity = initialCapacity;
        this.count = 0;
    }

    /**
     * Does not clear the information, only sets 'this.count' to '0'.
     */
    clear() {
        this.count = 0;
    }

    /**
     * TODO: ensure all the parameters are encoded, especially because I'm noticing myself forgetting.
     */
    insert(index: number, int32Value: number) {
        this.ensureCapacityForInsertion(index, 1);

        if (index !== this.count) {
            this.copyTo(this.data, index, this.data, index + 1, this.count - index);
        }

        this.data[index] = int32Value;

        this.count++;
    }

    /**
     * Does not clear trailing information.
     * 
     * count === 0 immediately returns
     */
    removeAt(index: number, count: number) {

        if (index > this.count) { throw new Error('removeAt(...): index > this.count'); }
        if (index + count > this.count) { throw new Error('removeAt(...): index + count > this.count'); }
        if (count === 0) { return; }

        if (index + count === this.count) {
            let shiftableCount = this.count - (index + count);
            if (shiftableCount > 0) {
                this.copyTo(
                    this.data,
                    index + count,
                    this.data,
                    index,
                    shiftableCount);
            }
        }
        else {
            this.copyTo(
                this.data,
                index + count,
                this.data,
                index,
                this.count - (index + count));
        }

        this.count -= count;
    }

    /**
     * - If the size asked for cannot be allocated, an exception will be thrown. (presumably the wording "thrown by the runtime" is involved.)
     * - JavaScript numbers do not wrap around to negative values when the value is very large.
     *       They instead approach infinity and lose precision.
     *       - There still is a check for whether the new, expected to be larger, capacity is smaller for whatever reason.
     *         Since this ought to be a negligible check for this method to perform.
     *         And failure to catch that case if it happens is an infinite loop.
     */
    ensureCapacityForInsertion(index: number, count: number) {
        let capacityPrevious = this.capacity;
        while (true) {
            if (this.count + count > this.capacity) {
                this.doubleCapacity();
            }
            else if (index >= this.capacity) {
                this.doubleCapacity();
            }
            else {
                break;
            }

            if (this.capacity === capacityPrevious) {
                break;
            }
            if (this.capacity < capacityPrevious) {
                throw new Error('ensureCapacityForInsertion(...): this.capacity < capacityPrevious');
            }

            capacityPrevious = this.capacity;
        }
    }

    doubleCapacity() {
        let capacityNew = this.capacity * 2;
        let bytesNew = new Uint32Array(capacityNew);
        this.copyTo(this.data, 0, bytesNew, 0, this.count);
        this.data = bytesNew;
        this.capacity = capacityNew;
    }

    /**
     * inclusive/exclusive
     */
    copyTo(bytesSource: Uint32Array, sourceStart: number, bytesDestination: Uint32Array, destinationStart: number, length: number) {

        if (bytesSource === bytesDestination) {
            if (bytesSource !== this.data) {
                throw new Error('bytesSource === bytesDestination ; but bytesSource !== this');
            }

            this.data.copyWithin(destinationStart, sourceStart, sourceStart + length);
        }
        else {
            // TODO: use 'set' method here and other such locations
            for (var i = 0; i < length; i++) {
                bytesDestination[destinationStart + i] = bytesSource[sourceStart + i];
            }
        }
    }
}
