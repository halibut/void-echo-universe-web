import Paper from 'paper';

class PaperUtilsApi {

    interpColors = (from, to, amount) => {
        const clmp = Math.max(0, Math.min(amount, 1));

        const diff = to.subtract(from);
        const interp = diff.multiply(clmp);

        const color = from.add(interp);
        color.alpha = from.alpha + ((from.alpha - to.alpha) * clmp);

        return color;
    }

    
};

const PaperUtils = new PaperUtilsApi();
export default PaperUtils;