type WaveDividerProps = {
  background: string;
  fill: string;
  path: string;
};

export default function WaveDivider({ background, fill, path }: WaveDividerProps) {
  return (
    <div className="leading-none overflow-hidden bg-[linear-gradient(135deg,#020618_0%,#020618_50%,#020618_100%)]">
      <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill={fill} d={path} />
      </svg>
    </div>
  );
}
