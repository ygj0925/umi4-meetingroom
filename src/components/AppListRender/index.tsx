import { QuestionCircleOutlined } from '@ant-design/icons';
import '@umijs/max';
export type SiderTheme = 'light' | 'dark';

const AppListRender: React.FC = (props) => {
  console.log(props);
  
  return (
    <a
      href="https://pro.ant.design/docs/getting-started"
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        padding: '4px',
        fontSize: '18px',
        color: 'inherit',
      }}
    >
      <QuestionCircleOutlined />
    </a>
  );
};

export default AppListRender;
