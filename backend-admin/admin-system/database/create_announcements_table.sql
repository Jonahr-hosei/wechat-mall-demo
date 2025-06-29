-- 创建商场公告表
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general', -- general: 一般公告, important: 重要公告, promotion: 促销公告
    status INTEGER DEFAULT 1, -- 1: 启用, 0: 禁用
    priority INTEGER DEFAULT 0, -- 优先级，数字越大优先级越高
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- 插入一些示例数据
INSERT INTO announcements (title, content, type, priority, status) VALUES
('欢迎光临我们的商场', '感谢您选择我们的商场，我们致力于为您提供最优质的服务和商品。如有任何问题，请随时联系我们的客服团队。', 'general', 1, 1),
('商场营业时间调整', '为了更好地服务顾客，我们的营业时间调整为：周一至周日 9:00-22:00。感谢您的理解与支持。', 'important', 2, 1),
('新春特惠活动', '新春佳节即将到来，全场商品8折起，更有精美礼品相送！活动时间：1月20日-2月10日。', 'promotion', 3, 1),
('停车场维护通知', '为了提供更好的停车服务，地下停车场将于本周六进行设备维护，预计维护时间2小时，给您带来的不便敬请谅解。', 'general', 1, 1),
('会员积分规则更新', '为了更好地回馈会员，我们更新了积分规则。消费1元可获得1积分，积分可用于抵扣购物金额。详情请咨询客服。', 'important', 2, 1);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 